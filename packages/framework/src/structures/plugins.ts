/**
 * Provides the plugin system for the PeridotJS framework.
 * This module enables extending the framework's functionality through plugins.
 * 
 * The plugin system provides:
 * - Lifecycle hooks for various stages of bot initialization and operation
 * - Type-safe plugin registration and management
 * - Ability to modify client behavior at key points
 * 
 * @module structures/plugins
 * @since 0.2.6
 */

import type { Awaitable } from '@sapphire/utilities';
import { type ClientOptions } from 'discord.js';

import type { PeridotClient } from './client.js';

// #region Symbols
/**
 * Symbol for the pre-generics initialization hook.
 * Called before any generics are initialized.
 * @since 0.2.6
 * @category Symbols
 */
export const preGenericsInitialization: unique symbol = Symbol('PeridotFrameworkPluginsPreGenericsInitialization');

/**
 * Symbol for the pre-initialization hook.
 * Called before the client is initialized.
 * @since 0.2.6
 * @category Symbols
 */
export const preInitialization: unique symbol = Symbol('PeridotFrameworkPluginsPreInitialization');

/**
 * Symbol for the post-initialization hook.
 * Called after the client is initialized.
 * @since 0.2.6
 * @category Symbols
 */
export const postInitialization: unique symbol = Symbol('PeridotFrameworkPluginsPostInitialization');

/**
 * Symbol for the pre-login hook.
 * Called before the client logs in.
 * @since 0.2.6
 * @category Symbols
 */
export const preLogin: unique symbol = Symbol('PeridotFrameworkPluginsPreLogin');

/**
 * Symbol for the post-login hook.
 * Called after the client logs in.
 * @since 0.2.6
 * @category Symbols
 */
export const postLogin: unique symbol = Symbol('PeridotFrameworkPluginsPostLogin');

/**
 * Symbol for the pre-handler run hook.
 * Called before any handler is executed.
 * @since 0.2.6
 * @category Symbols
 */
export const preHandlerRun: unique symbol = Symbol('PeridotFrameworkPluginsPreHandlerRun');

// #endregion Symbols

// #region Plugin
/**
 * Base class for creating PeridotJS plugins.
 * Plugins can hook into various stages of the bot's lifecycle to modify or extend functionality.
 * 
 * @since 0.2.6
 * @category Classes
 * @example
 * ```typescript
 * class MyPlugin extends Plugin {
 *   public static [preLogin] = async function(this: PeridotClient) {
 *     this.logger.info('Bot is about to log in!');
 *   }
 * }
 * ```
 */
export abstract class Plugin {
    public static [preGenericsInitialization]?: (this: PeridotClient, options: ClientOptions) => void;
    public static [preInitialization]?: (this: PeridotClient, options: ClientOptions) => void;
    public static [postInitialization]?: (this: PeridotClient, options: ClientOptions) => void;
    public static [preLogin]?: (this: PeridotClient, options: ClientOptions) => Awaitable<void>;
    public static [postLogin]?: (this: PeridotClient, options: ClientOptions) => Awaitable<void>;
}

/**
 * Enumeration of available plugin hooks.
 * These hooks represent different points in the bot's lifecycle where plugins can intervene.
 * 
 * @since 0.2.6
 * @category Enums
 */
export enum PluginHook {
    PreGenericsInitialization = 'preGenericsInitialization',
    PreInitialization = 'preInitialization',
    PostInitialization = 'postInitialization',
    PreLogin = 'preLogin',
    PostLogin = 'postLogin',
    PreHandlerRun = 'preHandlerRun',
}

// #region PluginManager
/**
 * Type representing hooks that can be asynchronous.
 * @since 0.2.6
 * @category Types
 */
export type AsyncPluginHooks = PluginHook.PreLogin | PluginHook.PostLogin;

/**
 * Interface for asynchronous plugin hooks.
 * @since 0.2.6
 * @category Interfaces
 */
export interface PeridotPluginAsyncHook {
    (this: PeridotClient, options: ClientOptions): Awaitable<unknown>;
}

/**
 * Type representing hooks that must be synchronous.
 * @since 0.2.6
 * @category Types
 */
export type SyncPluginHooks = Exclude<PluginHook, AsyncPluginHooks>;

/**
 * Interface for synchronous plugin hooks.
 * @since 0.2.6
 * @category Interfaces
 */
export interface PeridotPluginHook {
    (this: PeridotClient, options: ClientOptions): unknown;
}

/**
 * Interface representing a plugin hook entry in the registry.
 * @since 0.2.6
 * @category Interfaces
 * @typeParam T - The type of hook (sync or async)
 */
export interface PeridotPluginHookEntry<T = PeridotPluginHook | PeridotPluginAsyncHook> {
    hook: T;
    type: PluginHook;
    name?: string;
}

/**
 * Manager class for handling plugin registration and execution.
 * Provides methods for registering hooks and managing the plugin lifecycle.
 * 
 * @since 0.2.6
 * @category Classes
 * @example
 * ```typescript
 * const manager = new PluginManager();
 * 
 * // Register a pre-login hook
 * manager.registerPreLoginHook(async function() {
 *   this.logger.info('About to log in!');
 * });
 * ```
 */
export class PluginManager {
    public readonly registry = new Set<PeridotPluginHookEntry>();

    /**
     * Register a new plugin hook.
     * @param hook - The hook function to register
     * @param type - The type of hook
     * @param name - Optional name for the hook
     * @throws {TypeError} If the hook is not a function
     */
    public registerHook(hook: PeridotPluginHook, type: SyncPluginHooks, name?: string): this;
    public registerHook(hook: PeridotPluginAsyncHook, type: AsyncPluginHooks, name?: string): this;
    public registerHook(hook: PeridotPluginHook | PeridotPluginAsyncHook, type: PluginHook, name?: string): this {
        if (typeof hook !== 'function') throw new TypeError(`The provided hook ${name ? `(${name}) ` : ''}is not a function`);
        this.registry.add({ hook, type, name });
        return this;
    }

    /**
     * Register a hook for the pre-generics initialization phase.
     * @param hook - The hook function to register
     * @param name - Optional name for the hook
     */
    public registerPreGenericsInitializationHook(hook: PeridotPluginHook, name?: string) {
        return this.registerHook(hook, PluginHook.PreGenericsInitialization, name);
    }

    /**
     * Register a hook for the pre-initialization phase.
     * @param hook - The hook function to register
     * @param name - Optional name for the hook
     */
    public registerPreInitializationHook(hook: PeridotPluginHook, name?: string) {
        return this.registerHook(hook, PluginHook.PreInitialization, name);
    }

    /**
     * Register a hook for the post-initialization phase.
     * @param hook - The hook function to register
     * @param name - Optional name for the hook
     */
    public registerPostInitializationHook(hook: PeridotPluginHook, name?: string) {
        return this.registerHook(hook, PluginHook.PostInitialization, name);
    }

    /**
     * Register a hook for the pre-login phase.
     * @param hook - The hook function to register
     * @param name - Optional name for the hook
     */
    public registerPreLoginHook(hook: PeridotPluginAsyncHook, name?: string) {
        return this.registerHook(hook, PluginHook.PreLogin, name);
    }

    /**
     * Register a hook for the post-login phase.
     * @param hook - The hook function to register
     * @param name - Optional name for the hook
     */
    public registerPostLoginHook(hook: PeridotPluginAsyncHook, name?: string) {
        return this.registerHook(hook, PluginHook.PostLogin, name);
    }

    /**
     * Register a hook for the pre-handler run phase.
     * @param hook - The hook function to register
     * @param name - Optional name for the hook
     */
    public registerPreHandlerRunHook(hook: PeridotPluginAsyncHook, name?: string) {
        return this.registerHook(hook, PluginHook.PreHandlerRun, name);
    }

    public use(plugin: typeof Plugin) {
        const possibleSymbolHooks: [symbol, PluginHook][] = [
            [preGenericsInitialization, PluginHook.PreGenericsInitialization],
            [preInitialization, PluginHook.PreInitialization],
            [postInitialization, PluginHook.PostInitialization],
            [preLogin, PluginHook.PreLogin],
            [postLogin, PluginHook.PostLogin],
            [preHandlerRun, PluginHook.PreHandlerRun],
        ];
        for (const [hookSymbol, hookType] of possibleSymbolHooks) {
            const hook = Reflect.get(plugin, hookSymbol) as PeridotPluginHook | PeridotPluginAsyncHook;
            if (typeof hook !== 'function') continue;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.registerHook(hook, hookType as any);
        }
        return this;
    }

    public values(): Generator<PeridotPluginHookEntry, void, unknown>;
    public values(hook: SyncPluginHooks): Generator<PeridotPluginHookEntry<PeridotPluginHook>, void, unknown>;
    public values(hook: AsyncPluginHooks): Generator<PeridotPluginHookEntry<PeridotPluginAsyncHook>, void, unknown>;
    public *values(hook?: PluginHook): Generator<PeridotPluginHookEntry, void, unknown> {
        for (const plugin of this.registry) {
            if (hook && plugin.type !== hook) continue;
            yield plugin;
        }
    }
}
// #endregion PluginManager
