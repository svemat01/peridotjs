import type { Awaitable } from '@sapphire/utilities';
import { type ClientOptions } from 'discord.js';

import type { PeridotClient } from './client.js';

// #region Symbols
export const preGenericsInitialization: unique symbol = Symbol('PeridotFrameworkPluginsPreGenericsInitialization');
export const preInitialization: unique symbol = Symbol('PeridotFrameworkPluginsPreInitialization');
export const postInitialization: unique symbol = Symbol('PeridotFrameworkPluginsPostInitialization');

export const preLogin: unique symbol = Symbol('PeridotFrameworkPluginsPreLogin');
export const postLogin: unique symbol = Symbol('PeridotFrameworkPluginsPostLogin');

export const preHandlerRun: unique symbol = Symbol('PeridotFrameworkPluginsPreHandlerRun');

// #endregion Symbols

// #region Plugin
export abstract class Plugin {
    public static [preGenericsInitialization]?: (this: PeridotClient, options: ClientOptions) => void;
    public static [preInitialization]?: (this: PeridotClient, options: ClientOptions) => void;
    public static [postInitialization]?: (this: PeridotClient, options: ClientOptions) => void;
    public static [preLogin]?: (this: PeridotClient, options: ClientOptions) => Awaitable<void>;
    public static [postLogin]?: (this: PeridotClient, options: ClientOptions) => Awaitable<void>;
    // public static [preHandlerRun]?: (this: PreHandlerRunPayload[keyof PreHandlerRunPayload], type: keyof PreHandlerRunPayload) => Awaitable<PreHandlerRunResponse[keyof PreHandlerRunPayload] | void>;
}

// #endregion Plugin

export enum PluginHook {
    PreGenericsInitialization = 'preGenericsInitialization',
    PreInitialization = 'preInitialization',
    PostInitialization = 'postInitialization',
    PreLogin = 'preLogin',
    PostLogin = 'postLogin',
    PreHandlerRun = 'preHandlerRun',
}

// #region PluginManager
export type AsyncPluginHooks = PluginHook.PreLogin | PluginHook.PostLogin;
export interface PeridotPluginAsyncHook {
    (this: PeridotClient, options: ClientOptions): Awaitable<unknown>;
}

export type SyncPluginHooks = Exclude<PluginHook, AsyncPluginHooks>;
export interface PeridotPluginHook {
    (this: PeridotClient, options: ClientOptions): unknown;
}

export interface PeridotPluginHookEntry<T = PeridotPluginHook | PeridotPluginAsyncHook> {
    hook: T;
    type: PluginHook;
    name?: string;
}

export class PluginManager {
    public readonly registry = new Set<PeridotPluginHookEntry>();

    public registerHook(hook: PeridotPluginHook, type: SyncPluginHooks, name?: string): this;
    public registerHook(hook: PeridotPluginAsyncHook, type: AsyncPluginHooks, name?: string): this;
    public registerHook(hook: PeridotPluginHook | PeridotPluginAsyncHook, type: PluginHook, name?: string): this {
        if (typeof hook !== 'function') throw new TypeError(`The provided hook ${name ? `(${name}) ` : ''}is not a function`);
        this.registry.add({ hook, type, name });
        return this;
    }

    public registerPreGenericsInitializationHook(hook: PeridotPluginHook, name?: string) {
        return this.registerHook(hook, PluginHook.PreGenericsInitialization, name);
    }

    public registerPreInitializationHook(hook: PeridotPluginHook, name?: string) {
        return this.registerHook(hook, PluginHook.PreInitialization, name);
    }

    public registerPostInitializationHook(hook: PeridotPluginHook, name?: string) {
        return this.registerHook(hook, PluginHook.PostInitialization, name);
    }

    public registerPreLoginHook(hook: PeridotPluginAsyncHook, name?: string) {
        return this.registerHook(hook, PluginHook.PreLogin, name);
    }

    public registerPostLoginHook(hook: PeridotPluginAsyncHook, name?: string) {
        return this.registerHook(hook, PluginHook.PostLogin, name);
    }

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
