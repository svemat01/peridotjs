import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

import type { ClientEvents } from 'discord.js';

import {
    type ButtonComponent,
    type ClientEvent,
    type ContextMenuCommand,
    type ModalComponent,
    type SelectMenuComponent,
    type SlashCommand,
    type TextCommand,
} from '../index.js';
import { container } from './container.js';

/**
 * A predicate to check if the structure is valid
 */
export type StructurePredicate<T> = (structure: unknown) => structure is T;

/**
 * Loads all the structures in the provided directory matching the predicate.
 *
 * **Ignores non .ts files, index.ts files, and files ending with .lib.ts.**
 *
 * @param dir - The directory to load the structures from
 * @param predicate - The predicate to check if the structure is valid
 * @param recursive - Whether to recursively load the structures in the directory
 * @returns
 */
export async function loadStructures<T>(dir: string, predicate: StructurePredicate<T>, recursive = true): Promise<T[]> {
    const { logger } = container;

    logger.trace({ dir }, 'Loading structures');
    // Get the stats of the directory
    const statDir = await stat(dir);

    // If the provided directory path is not a directory, throw an error
    if (!statDir.isDirectory()) {
        throw new Error(`The directory '${dir}' is not a directory.`);
    }

    // Get all the files in the directory
    const files = await readdir(dir);

    // Create an empty array to store the structures
    const structures: T[] = [];

    // Loop through all the files in the directory
    for (const file of files) {
        // console.log('Loading file', file);
        logger.trace({ dir, file }, 'Loading file');

        // Get the stats of the file
        const statFile = await stat(join(dir.toString(), file));

        // If the file is a directory and recursive is true, recursively load the structures in the directory
        if (statFile.isDirectory() && recursive) {
            structures.push(...(await loadStructures(`${dir}/${file}`, predicate, recursive)));
            continue;
        }

        // If the file is index.ts or the file does not end with .ts, skip the file
        if (file === 'index.ts' || !file.endsWith('.ts') || file.endsWith('.lib.ts')) {
            continue;
        }

        // Import the structure dynamically from the file
        const structure = (await import(`${dir}/${file}`)).default;

        // If the structure is a valid structure, add it
        if (predicate(structure)) structures.push(structure);
    }

    return structures;
}

/**
 * Represents the export structure for a handler.
 */
export type HandlerExport = {
    text?: TextCommand[];
    slash?: SlashCommand[];
    contextMenu?: ContextMenuCommand[];
    buttons?: ButtonComponent[];
    modals?: ModalComponent[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectMenus?: SelectMenuComponent<any>[];
    clientEvents?: ClientEvent<keyof ClientEvents>[];
    __brand: 'HandlerExport';
};

/**
 * Helper function to create a handler export object.
 *
 * @param handlerExport - The handler export object to create.
 * @returns The created handler export object.
 */
export const createHandlerExport = (handlerExport: Omit<HandlerExport, '__brand'>) => {
    return {
        ...handlerExport,
        __brand: 'HandlerExport' as const,
    };
};

/**
 * Checks if the given value is a valid handler export.
 *
 * @param handlerExport - The value to check.
 * @returns True if the value is a valid handler export, false otherwise.
 */
export const isHandlerExport = (handlerExport: unknown): handlerExport is HandlerExport =>
    typeof handlerExport === 'object' && handlerExport !== null && (handlerExport as HandlerExport)?.__brand === 'HandlerExport';

/**
 * Loads and exports handlers from the specified directory.
 *
 * @param dir - The directory to load handlers from.
 * @param recursive - Optional. Specifies whether to load handlers recursively. Default is true.
 * @param overwrite - Optional. Specifies whether to overwrite existing handlers. Default is true.
 * @returns A promise that resolves when the handlers are loaded and exported.
 */
export async function loadHandlerExports(dir: string, recursive = true, overwrite = true) {
    const { handlers, logger } = container;

    logger.debug({ dir }, 'Loading handlers from');

    const _exports = await loadStructures(dir, isHandlerExport, recursive);

    if (overwrite) {
        handlers.textCommands.clear();
        handlers.slashCommands.clear();
        handlers.contextMenuCommands.clear();
        handlers.buttons = [];
        handlers.modals = [];
        handlers.selectMenus = [];

        for (const [name, events] of handlers.clientEvents) {
            for (const event of events) {
                container.client.off(name, event.run);
            }
        }

        handlers.clientEvents.clear();
    }

    for (const _export of _exports) {
        for (const text of _export.text ?? []) {
            handlers.textCommands.set(text.data.name, text);
        }

        for (const slash of _export.slash ?? []) {
            handlers.slashCommands.set(slash.data.name, slash);
        }

        for (const contextMenu of _export.contextMenu ?? []) {
            handlers.contextMenuCommands.set(contextMenu.data.name, contextMenu);
        }

        for (const event of _export.clientEvents ?? []) {
            const events = handlers.clientEvents.get(event.name) ?? new Set();
            events.add(event);
            handlers.clientEvents.set(event.name, events);

            if (event.type === 'on') {
                container.client.on(event.name, event.run);
            } else {
                container.client.once(event.name, event.run);
            }
        }

        handlers.buttons.push(...(_export.buttons ?? []));
        handlers.modals.push(...(_export.modals ?? []));
        handlers.selectMenus.push(...(_export.selectMenus ?? []));
    }

    logger.debug({dir}, 'Loaded handlers from');
}
