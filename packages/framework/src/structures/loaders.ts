import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

import { isCmdExport } from '../index.js';
import { container } from './container.js';

/**
 * A predicate to check if the structure is valid
 */
export type StructurePredicate<T> = (structure: unknown) => structure is T;

/**
 * Loads all the structures in the provided directory
 *
 * @param dir - The directory to load the structures from
 * @param predicate - The predicate to check if the structure is valid
 * @param recursive - Whether to recursively load the structures in the directory
 * @returns
 */
export async function loadStructures<T>(dir: string, predicate: StructurePredicate<T>, recursive = true): Promise<T[]> {
    console.log('Loading structures from', dir);
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
        console.log('Loading file', file);

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

export async function loadCmdExports(dir: string, recursive = true, overwrite = true) {
    console.log('Loading commands from', dir);
    const _exports = await loadStructures(dir, isCmdExport, recursive);

    if (overwrite) {
        container.textCommands.clear();
        container.slashCommands.clear();
        container.contextMenuCommands.clear();
        container.buttons = [];
        container.modals = [];
        container.selectMenus = [];
    }

    for (const _export of _exports) {
        for (const text of _export.text ?? []) {
            container.textCommands.set(text.data.name, text);
        }

        for (const slash of _export.slash ?? []) {
            container.slashCommands.set(slash.data.name, slash);
        }

        for (const contextMenu of _export.contextMenu ?? []) {
            container.contextMenuCommands.set(contextMenu.data.name, contextMenu);
        }

        container.buttons.push(...(_export.buttons ?? []));
        container.modals.push(...(_export.modals ?? []));
        container.selectMenus.push(...(_export.selectMenus ?? []));
    }
}
