import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

import { err, ok, type Result } from '@sapphire/result';
import type { Awaitable } from '@sapphire/utilities/types';
import type { ClientEvents, SelectMenuType } from 'discord.js';

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

export const HandlerExportSymbol = Symbol('HandlerExport');

/**
 * Helper function to create a handler export object.
 *
 * @param handlerExport - The handler export object to create.
 * @returns The created handler export object.
 */
export const createHandlerExport = (handlerExport: Omit<HandlerExport, typeof HandlerExportSymbol>): HandlerExport => {
    return {
        ...handlerExport,
        [HandlerExportSymbol]: true,
    };
};

/**
 * Checks if the given value is a valid handler export.
 *
 * @param handlerExport - The value to check.
 * @returns True if the value is a valid handler export, false otherwise.
 */
export const isHandlerExport = (handlerExport: unknown): handlerExport is HandlerExport =>
    typeof handlerExport === 'object' && handlerExport !== null && (handlerExport as HandlerExport)[HandlerExportSymbol] === true;

export interface HandlerRegistry<T> {
    name: keyof HandlerRegistries;
    _register(handler: T): Awaitable<this>;
    _unregister(handler: T): Awaitable<this>;
    _unregisterAll(): Awaitable<this>;
}
export type HandlerExport = {
    [key in keyof HandlerRegistries]?: HandlerRegistries[key] extends HandlerRegistry<infer T> ? T[] : never;
} & {
    [HandlerExportSymbol]: true;
};

// #region Registries
export class TextCommandRegistry implements HandlerRegistry<TextCommand> {
    public readonly name = 'textCommands';

    private handlers = new Map<string, TextCommand>();
    private aliases = new Map<string, string>();

    public _register(handler: TextCommand): this {
        this.handlers.set(handler.data.name, handler);
        for (const alias of handler.data.aliases ?? []) {
            this.aliases.set(alias, handler.data.name);
        }
        return this;
    }

    public _unregister(handler: TextCommand): this {
        this.handlers.delete(handler.data.name);
        for (const alias of handler.data.aliases ?? []) {
            this.aliases.delete(alias);
        }
        return this;
    }

    public _unregisterAll(): this {
        this.handlers.clear();
        this.aliases.clear();
        return this;
    }

    public getHandlers(): TextCommand[] {
        return [...this.handlers.values()];
    }

    public getHandler(name: string): Result<TextCommand, Error> {
        let handler = this.handlers.get(name);

        if (handler === undefined) {
            const alias = this.aliases.get(name);
            if (alias !== undefined) {
                handler = this.handlers.get(alias);
            }
        }

        if (handler === undefined) {
            return err(new Error(`The handler '${name}' does not exist.`));
        }

        return ok(handler);
    }
}

export class SlashCommandRegistry implements HandlerRegistry<SlashCommand> {
    public readonly name = 'slashCommands';

    private handlers = new Map<string, SlashCommand>();

    public _register(handler: SlashCommand): Awaitable<this> {
        this.handlers.set(handler.data.name, handler);
        return this;
    }

    public _unregister(handler: SlashCommand): Awaitable<this> {
        this.handlers.delete(handler.data.name);
        return this;
    }

    public _unregisterAll(): Awaitable<this> {
        this.handlers.clear();
        return this;
    }

    public getHandlers(): SlashCommand[] {
        return [...this.handlers.values()];
    }

    public getHandler(name: string): Result<SlashCommand, Error> {
        const handler = this.handlers.get(name);
        if (handler === undefined) {
            return err(new Error(`The handler '${name}' does not exist.`));
        }

        return ok(handler);
    }
}

export class ContextMenuCommandRegistry implements HandlerRegistry<ContextMenuCommand> {
    public readonly name = 'contextMenuCommands';

    private handlers = new Map<string, ContextMenuCommand>();

    public _register(handler: ContextMenuCommand): Awaitable<this> {
        this.handlers.set(handler.data.name, handler);
        return this;
    }

    public _unregister(handler: ContextMenuCommand): Awaitable<this> {
        this.handlers.delete(handler.data.name);
        return this;
    }

    public _unregisterAll(): Awaitable<this> {
        this.handlers.clear();
        return this;
    }

    public getHandlers(): ContextMenuCommand[] {
        return [...this.handlers.values()];
    }

    public getHandler(name: string): Result<ContextMenuCommand, Error> {
        const handler = this.handlers.get(name);
        if (handler === undefined) {
            return err(new Error(`The handler '${name}' does not exist.`));
        }

        return ok(handler);
    }
}

export class ButtonComponentRegistry implements HandlerRegistry<ButtonComponent> {
    public readonly name = 'buttonComponents';
    private staticHandlers = new Map<string, ButtonComponent>();
    private regexHandlers = new Map<RegExp, ButtonComponent>();

    public _register(handler: ButtonComponent): Awaitable<this> {
        if (handler.customId instanceof RegExp) {
            this.regexHandlers.set(handler.customId, handler);
        } else {
            this.staticHandlers.set(handler.customId, handler);
        }
        return this;
    }

    public _unregister(handler: ButtonComponent): Awaitable<this> {
        if (handler.customId instanceof RegExp) {
            this.regexHandlers.delete(handler.customId);
        } else {
            this.staticHandlers.delete(handler.customId);
        }
        return this;
    }

    public _unregisterAll(): Awaitable<this> {
        this.staticHandlers.clear();
        this.regexHandlers.clear();
        return this;
    }

    public getHandlers(): ButtonComponent[] {
        return [...this.staticHandlers.values(), ...this.regexHandlers.values()];
    }

    public getHandler(id: string): Result<ButtonComponent, Error> {
        const staticHandler = this.staticHandlers.get(id);
        if (staticHandler !== undefined) {
            return ok(staticHandler);
        }

        for (const [regex, handler] of this.regexHandlers) {
            if (regex.test(id)) {
                return ok(handler);
            }
        }

        return err(new Error(`The handler '${id}' does not exist.`));
    }
}

export class ModalComponentRegistry implements HandlerRegistry<ModalComponent> {
    public readonly name = 'modalComponents';

    private staticHandlers = new Map<string, ModalComponent>();
    private regexHandlers = new Map<RegExp, ModalComponent>();

    public _register(handler: ModalComponent): Awaitable<this> {
        if (handler.customId instanceof RegExp) {
            this.regexHandlers.set(handler.customId, handler);
        } else {
            this.staticHandlers.set(handler.customId, handler);
        }
        return this;
    }
    public _unregister(handler: ModalComponent): Awaitable<this> {
        if (handler.customId instanceof RegExp) {
            this.regexHandlers.delete(handler.customId);
        } else {
            this.staticHandlers.delete(handler.customId);
        }
        return this;
    }
    public _unregisterAll(): Awaitable<this> {
        this.staticHandlers.clear();
        this.regexHandlers.clear();
        return this;
    }
    public getHandlers(): ModalComponent[] {
        return [...this.staticHandlers.values(), ...this.regexHandlers.values()];
    }
    public getHandler(id: string): Result<ModalComponent, Error> {
        const staticHandler = this.staticHandlers.get(id);
        if (staticHandler !== undefined) {
            return ok(staticHandler);
        }
        for (const [regex, handler] of this.regexHandlers) {
            if (regex.test(id)) {
                return ok(handler);
            }
        }
        return err(new Error(`The handler '${id}' does not exist.`));
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class SelectMenuComponentRegistry implements HandlerRegistry<SelectMenuComponent<any>> {
    public readonly name = 'selectMenuComponents';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private staticHandlers = new Map<string, SelectMenuComponent<any>>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private regexHandlers = new Map<RegExp, SelectMenuComponent<any>>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public _register(handler: SelectMenuComponent<any>): Awaitable<this> {
        if (handler.customId instanceof RegExp) {
            this.regexHandlers.set(handler.customId, handler);
        } else {
            this.staticHandlers.set(handler.customId, handler);
        }
        return this;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public _unregister(handler: SelectMenuComponent<any>): Awaitable<this> {
        if (handler.customId instanceof RegExp) {
            this.regexHandlers.delete(handler.customId);
        } else {
            this.staticHandlers.delete(handler.customId);
        }
        return this;
    }
    public _unregisterAll(): Awaitable<this> {
        this.staticHandlers.clear();
        this.regexHandlers.clear();
        return this;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public getHandlers(): SelectMenuComponent<any>[] {
        return [...this.staticHandlers.values(), ...this.regexHandlers.values()];
    }
    public getHandler(id: string): Result<SelectMenuComponent<SelectMenuType>, Error> {
        const staticHandler = this.staticHandlers.get(id);
        if (staticHandler !== undefined) {
            return ok(staticHandler);
        }
        for (const [regex, handler] of this.regexHandlers) {
            if (regex.test(id)) {
                return ok(handler);
            }
        }
        return err(new Error(`The handler '${id}' does not exist.`));
    }
}

export class ClientEventRegistry implements HandlerRegistry<ClientEvent<keyof ClientEvents>> {
    public readonly name = 'clientEvents';

    private handlers = new Map<keyof ClientEvents, Set<ClientEvent<keyof ClientEvents>>>();

    public _register(handler: ClientEvent<keyof ClientEvents>): Awaitable<this> {
        const events = this.handlers.get(handler.name) ?? new Set();
        events.add(handler);
        this.handlers.set(handler.name, events);

        if (handler.type === 'on') {
            container.client.on(handler.name, handler.run);
        } else {
            container.client.once(handler.name, handler.run);
        }

        return this;
    }

    public _unregister(handler: ClientEvent<keyof ClientEvents>): Awaitable<this> {
        const events = this.handlers.get(handler.name);
        if (events !== undefined) {
            events.delete(handler);
            if (events.size === 0) {
                this.handlers.delete(handler.name);
            }
        }

        container.client.off(handler.name, handler.run);

        return this;
    }

    public _unregisterAll(): Awaitable<this> {
        for (const [name, events] of this.handlers) {
            for (const event of events) {
                container.client.off(name, event.run);
            }
        }

        this.handlers.clear();
        return this;
    }

    public getAllHandlers() {
        return this.handlers;
    }

    public getHandlers(name: keyof ClientEvents): Result<Set<ClientEvent<keyof ClientEvents>>, Error> {
        const handlers = this.handlers.get(name);
        if (handlers === undefined) {
            return err(new Error(`The handlers for '${name}' do not exist.`));
        }

        return ok(handlers);
    }
}

export interface HandlerRegistries {
    textCommands: TextCommandRegistry;
    slashCommands: SlashCommandRegistry;
    contextMenuCommands: ContextMenuCommandRegistry;
    buttonComponents: ButtonComponentRegistry;
    modalComponents: ModalComponentRegistry;
    selectMenuComponents: SelectMenuComponentRegistry;
    clientEvents: ClientEventRegistry;
}
// #endregion Registries

/**
 * Represents a registry manager for handlers.
 * This framework provides handler registries for text commands, slash commands, context menu commands, buttons, modals, select menus, and client events.
 * Plugins can also create their own registries for custom handlers implementing the {@link HandlerRegistry} interface.
 */
export class HandlerRegistryManager {
    // We can't hardcode the different registries because additional ones can be added by plugins
    // So we use a map to store the registries
    public readonly registries = new Map<keyof HandlerRegistries, HandlerRegistries[keyof HandlerRegistries]>();

    /**
     * Registers a handler registry.
     * @param registry The registry to register.
     */
    public registerRegistry<T extends HandlerRegistries[keyof HandlerRegistries]>(registry: T): this {
        this.registries.set(registry.name, registry);
        return this;
    }

    /**
     * Unregister a handler registry.
     * @param registry The registry to unregister.
     */
    public unregisterRegistry<T extends HandlerRegistry<unknown>>(registry: T): this {
        this.registries.delete(registry.name);
        return this;
    }

    /**
     * Unregister all handler registries.
     */
    public unregisterAllRegistries(): this {
        this.registries.clear();
        return this;
    }

    /**
     * Get a handler registry by name.
     * @param name The name of the registry to get.
     */
    public getRegistry<T extends keyof HandlerRegistries>(name: T): Result<HandlerRegistries[T], Error> {
        const registry = this.registries.get(name);
        if (registry === undefined) {
            return err(new Error(`The registry '${name}' does not exist.`));
        }

        return ok(registry as unknown as HandlerRegistries[T]);
    }

    /**
     * Get all handler registries.
     */
    public getRegistries(): HandlerRegistries {
        return this.registries as unknown as HandlerRegistries;
    }

    public async loadHandlerExports(dir: string, recursive = true, overwrite = true) {
        const { logger } = container;

        logger.debug({ dir }, 'Loading handlers from');

        const _exports = await loadStructures(dir, isHandlerExport, recursive);

        if (overwrite) {
            await Promise.all([...this.registries.values()].map((registry) => registry._unregisterAll()));
        }

        for (const _export of _exports) {
            for (const [name, registry] of this.registries.entries()) {
                for (const handler of _export[name] ?? []) {
                    await registry._register(handler as never);
                }
            }
        }
    }
}

/**
 * Used to register the built-in handler registries.
 * @private This is an internal function and should not be used.
 */
export const registerBuiltInHandlerRegistries = (manager: HandlerRegistryManager) => {
    manager.registerRegistry(new TextCommandRegistry());
    manager.registerRegistry(new SlashCommandRegistry());
    manager.registerRegistry(new ContextMenuCommandRegistry());
    manager.registerRegistry(new ButtonComponentRegistry());
    manager.registerRegistry(new ModalComponentRegistry());
    manager.registerRegistry(new SelectMenuComponentRegistry());
    manager.registerRegistry(new ClientEventRegistry());
}
