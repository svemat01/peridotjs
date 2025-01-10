/**
 * Provides functionality for loading and managing handlers in the PeridotJS framework.
 * This module is responsible for:
 * - Loading handler files from directories
 * - Managing handler registries for different types of handlers (commands, events, etc.)
 * - Providing type-safe handler creation and registration
 * 
 * The core concept is the HandlerRegistryManager which is accessible through the container
 * and manages all the different types of handlers in your bot.
 * 
 * @module structures/loaders
 * @since 0.2.6
 */

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
 * A predicate function used to validate loaded structures.
 * Used internally by the framework to ensure loaded files export valid handlers.
 * 
 * @since 0.2.6
 * @category Types
 * @typeParam T - The type of structure to validate
 */
export type StructurePredicate<T> = (structure: unknown) => structure is T;

/**
 * Loads all the structures in the provided directory matching the predicate.
 * This is the core function used by the framework to load handlers from files.
 *
 * **Ignores non .ts files, index.ts files, and files ending with .lib.ts.**
 *
 * @since 0.2.6
 * @category Functions
 * @param dir - The directory to load the structures from
 * @param predicate - The predicate to check if the structure is valid
 * @param recursive - Whether to recursively load the structures in the directory
 * @returns An array of loaded structures
 * @throws {Error} If the provided path is not a directory
 * @example
 * ```ts
 * // Load all handler exports from a directory
 * const handlers = await loadStructures('./handlers', isHandlerExport);
 * ```
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
 * Symbol used to mark handler exports. Used internally by the framework.
 * Instead of using this directly, use the {@link createHandlerExport} function.
 * 
 * @since 0.2.6
 * @category Symbols
 * @internal
 */
export const HandlerExportSymbol = Symbol('HandlerExport');

/**
 * Helper function to create a type-safe handler export object.
 * This is the recommended way to export handlers from a file.
 *
 * @since 0.2.6
 * @category Functions
 * @param handlerExport - The handler export object to create
 * @returns The created handler export object
 * @example
 * ```ts
 * import { createHandlerExport, type SlashCommand } from '@peridotjs/framework';
 * 
 * const pingCommand = {
 *     data: {
 *         name: 'ping',
 *         description: 'Replies with pong!',
 *     },
 *     guilds: ["MY_GUILD_ID"],
 *     async run(interaction) {
 *         await interaction.reply('Pong!');
 *     },
 * } satisfies SlashCommand;
 * 
 * export default createHandlerExport({
 *     slashCommands: [pingCommand],
 * });
 * ```
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

/**
 * Interface defining the basic structure of a handler registry.
 * All handler registries must implement this interface to be compatible with the framework.
 * 
 * @since 0.2.6
 * @category Interfaces
 * @typeParam T - The type of handler this registry manages
 */
export interface HandlerRegistry<T> {
    /** The name of this registry in the {@link HandlerRegistries} */
    name: keyof HandlerRegistries;
    /** Register a handler in this registry */
    _register(handler: T): Awaitable<this>;
    /** Unregister a handler from this registry */
    _unregister(handler: T): Awaitable<this>;
    /** Unregister all handlers from this registry */
    _unregisterAll(): Awaitable<this>;
}

/**
 * Type representing a handler export object.
 * This is what your handler files should export as their default export.
 * Use {@link createHandlerExport} to create this type safely.
 * 
 * @since 0.2.6
 * @category Types
 * @example
 * ```ts
 * export default createHandlerExport({
 *   slashCommands: [myCommand],
 *   buttonComponents: [myButton]
 * });
 * ```
 */
export type HandlerExport = {
    [key in keyof HandlerRegistries]?: HandlerRegistries[key] extends HandlerRegistry<infer T> ? T[] : never;
} & {
    [HandlerExportSymbol]: true;
};

/**
 * Type-safe handler creation helper.
 * Avoids the need to cast the handler to the correct type manually.
 * 
 * @since 0.2.6
 * @category Functions
 * @typeParam _Kind - The registry kind (with or without 's' suffix)
 * @typeParam Kind - The normalized registry kind (without 's' suffix)
 * @typeParam T - The type of handler being created
 * @param _kind - The kind of handler to create
 * @param handler - The handler to create
 * @returns The created handler with proper type inference
 */
export const createHandler = <
    _Kind extends keyof HandlerRegistries,
    Kind extends _Kind extends `${infer K}s` ? K : _Kind,
    T extends HandlerRegistries[Kind extends keyof HandlerRegistries ? Kind : `${Kind}s`] extends HandlerRegistry<infer U> ? U : never,
>(
    _kind: Kind,
    handler: T,
): T => {
    return handler;
};

// #region Registries
/**
 * Registry for text-based commands.
 * Handles registration and lookup of commands that are triggered by text messages.
 * 
 * @since 0.2.6
 * @category Classes
 */
export class TextCommandRegistry implements HandlerRegistry<TextCommand> {
    public readonly name = 'textCommands';

    private handlers = new Map<string, TextCommand>();
    private aliases = new Map<string, string>();

    /**
     * Register a text command in this registry
     * @param handler - The command to register
     */
    public _register(handler: TextCommand): this {
        this.handlers.set(handler.data.name, handler);
        for (const alias of handler.data.aliases ?? []) {
            this.aliases.set(alias, handler.data.name);
        }
        return this;
    }

    /**
     * Unregister a text command from this registry
     * @param handler - The command to unregister
     */
    public _unregister(handler: TextCommand): this {
        this.handlers.delete(handler.data.name);
        for (const alias of handler.data.aliases ?? []) {
            this.aliases.delete(alias);
        }
        return this;
    }

    /**
     * Unregister all text commands from this registry
     */
    public _unregisterAll(): this {
        this.handlers.clear();
        this.aliases.clear();
        return this;
    }

    /**
     * Get all registered text commands
     * @returns Array of all registered text commands
     */
    public getHandlers(): TextCommand[] {
        return [...this.handlers.values()];
    }

    /**
     * Get a text command by name or alias
     * @param name - The name or alias of the command to get
     * @returns Result containing either the command or an error
     */
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

/**
 * Registry for slash commands.
 * Handles registration and lookup of Discord application commands.
 * 
 * @since 0.2.6
 * @category Classes
 */
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ClientEventRegistry implements HandlerRegistry<ClientEvent<any>> {
    public readonly name = 'clientEvents';

    private handlers = new Map<keyof ClientEvents, Set<ClientEvent<keyof ClientEvents>>>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public _register(handler: ClientEvent<any>): Awaitable<this> {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public _unregister(handler: ClientEvent<any>): Awaitable<this> {
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

/**
 * Interface defining all available handler registries.
 * Used for type safety when accessing registries through the container.
 * 
 * @since 0.2.6
 * @category Interfaces
 */
export interface HandlerRegistries {
    textCommands: TextCommandRegistry;
    slashCommands: SlashCommandRegistry;
    contextMenuCommands: ContextMenuCommandRegistry;
    buttonComponents: ButtonComponentRegistry;
    modalComponents: ModalComponentRegistry;
    selectMenuComponents: SelectMenuComponentRegistry;
    clientEvents: ClientEventRegistry;
}

/**
 * Represents a registry manager for handlers.
 * This framework provides handler registries for text commands, slash commands, context menu commands, buttons, modals, select menus, and client events.
 * Plugins can also create their own registries for custom handlers implementing the {@link HandlerRegistry} interface.
 * 
 * The registry manager is accessible through the container object: `container.handlers`
 *
 * @since 0.2.6
 * @category Classes
 * @example
 * ```ts
 * // Load handlers from a directory
 * await container.handlers.loadHandlerExports(
 *   new URL('handlers/', import.meta.url).pathname
 * );
 * 
 * // Get a specific registry
 * const slashCommands = container.handlers.getRegistry('slashCommands');
 * ```
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

    /**
     * Loads handler exports from a directory.
     * This is the recommended way to load handlers into your bot.
     * 
     * @since 0.2.6
     * @param dir - The directory to load handler exports from
     * @param recursive - Whether to recursively load handler exports from subdirectories
     * @param overwrite - Whether to unregister existing handlers before loading new ones
     * @example
     * ```ts
     * // Load all handlers from the handlers directory
     * await container.handlers.loadHandlerExports(
     *   new URL('handlers/', import.meta.url).pathname
     * );
     * ```
     */
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
 * @internal This is an internal function and should not be used directly.
 * @since 0.2.6
 */
export const registerBuiltInHandlerRegistries = (manager: HandlerRegistryManager) => {
    manager.registerRegistry(new TextCommandRegistry());
    manager.registerRegistry(new SlashCommandRegistry());
    manager.registerRegistry(new ContextMenuCommandRegistry());
    manager.registerRegistry(new ButtonComponentRegistry());
    manager.registerRegistry(new ModalComponentRegistry());
    manager.registerRegistry(new SelectMenuComponentRegistry());
    manager.registerRegistry(new ClientEventRegistry());
};
