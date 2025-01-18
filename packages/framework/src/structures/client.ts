import type { Awaitable, ClientOptions, Snowflake } from 'discord.js';
import { Client } from 'discord.js';
import type { i18n } from 'i18next';
import type { Logger } from 'pino';

import { _registerCoreEventHandlers, Events } from '../events/index.js';
import type { TextCommandMessage } from '../handlers/TextCommand.js';
import { container } from './container.js';
import { _registerBuiltInHandlerRegistries, HandlerRegistryManager } from './loaders.js';
import type { PermissionLevelConfig } from './permissions.js';
import { Plugin, PluginHook, PluginManager } from './plugins.js';

/**
 * Valid prefix types for command recognition.
 * @since 0.2.6
 * @category Client
 * @example
 * ```typescript
 * // Single prefix
 * const prefix: PeridotPrefix = '!';
 *
 * // Multiple prefixes
 * const prefixes: PeridotPrefix = ['!', '?', '.'];
 *
 * // Mention only (no prefix)
 * const noPrefix: PeridotPrefix = null;
 * ```
 */
export type PeridotPrefix = string | readonly string[] | null;

/**
 * Function type for dynamically determining command prefixes.
 * @since 0.2.6
 * @category Client
 * @example
 * ```typescript
 * const prefixHook: PeridotPrefixHook = async (message) => {
 *   // Get prefix from database based on guild
 *   const prefix = await db.getPrefix(message.guild.id);
 *   return prefix ?? '!'; // Fallback to ! if no prefix set
 * };
 * ```
 */
export type PeridotPrefixHook = {
    (message: TextCommandMessage): Awaitable<PeridotPrefix>;
};

/**
 * Configuration options for the Peridot client.
 * Extends Discord.js ClientOptions with additional Peridot-specific options.
 * @since 0.2.6
 * @category Client
 * @example
 * ```typescript
 * const options: PeridotClientOptions = {
 *   defaultPrefix: '!',
 *   regexPrefix: /^(hey +)?bot[,! ]/i,
 *   logger: pino(),
 *   i18n: i18next,
 *   typing: true,
 *   permissionConfig: {
 *     global: {},
 *     guilds: {}
 *   }
 * };
 * ```
 */
export interface PeridotClientOptions {
    /**
     * The default command prefix.
     * @since 0.2.6
     * @default null
     * @example '!' or ['!', '?'] or null
     */
    defaultPrefix?: PeridotPrefix;

    /**
     * Regex pattern for natural language command prefixes.
     * @since 0.2.6
     * @example
     * ```typescript
     * /^(hey +)?bot[,! ]/i
     * // Matches: "hey bot", "bot!", "hey bot," etc.
     * ```
     */
    regexPrefix?: RegExp;

    /**
     * Function to dynamically determine command prefix.
     * @since 0.2.6
     * @default () => client.options.defaultPrefix
     * @see {@link PeridotPrefixHook}
     */
    fetchPrefix?: PeridotPrefixHook;

    /**
     * The client's unique identifier.
     * @since 0.2.6
     * @default this.client.user?.id ?? null
     */
    id?: Snowflake;

    /**
     * Logger instance for framework and plugin logging.
     * @since 0.2.6
     * @requires pino
     */
    logger: Logger;

    /**
     * Internationalization instance for translations.
     * @since 0.2.6
     * @requires i18next
     */
    i18n: i18n | undefined;

    /**
     * Whether to show typing indicator during command processing.
     * @since 0.2.6
     * @default false
     */
    typing?: boolean;

    /**
     * Whether to disable using mentions as command prefixes.
     * @since 0.2.6
     * @default false
     */
    disableMentionPrefix?: boolean;

    /**
     * Permission configuration for command access control.
     * @since 0.2.6
     * @see {@link PermissionLevelConfig}
     */
    permissionConfig: PermissionLevelConfig;
}

/**
 * The core client class for Peridot bots.
 * Extends Discord.js Client with Peridot-specific functionality.
 * @since 0.2.6
 * @category Client
 * @template Ready - Whether the client is ready
 * @example
 * ```typescript
 * const client = new PeridotClient({
 *     intents: [
 *         GatewayIntentBits.Guilds,
 *         GatewayIntentBits.GuildMembers,
 *         GatewayIntentBits.GuildMessages,
 *         GatewayIntentBits.DirectMessages,
 *         GatewayIntentBits.GuildVoiceStates,
 *         GatewayIntentBits.MessageContent,
 *         GatewayIntentBits.GuildMessageReactions,
 *     ],
 *     presence: {
 *         activities: [
 *             {
 *                 name: 'with cool stuff',
 *                 type: ActivityType.Playing,
 *             },
 *         ],
 *     },
 *     partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember],
 *     logger: pino(),
 *     permissionConfig: {
 *         global: {
 *             'ID': PermissionLevel.OWNER,
 *         },
 *         guilds: {},
 *     },
 *     defaultPrefix: '+',
 * });
 *
 * await client.login('token');
 * ```
 */
export class PeridotClient<Ready extends boolean = boolean> extends Client<Ready> {
    /**
     * The client's unique identifier.
     * Set automatically when the client becomes ready.
     * @since 0.2.6
     */
    public override id: Snowflake | null = null;

    /**
     * Function to determine command prefix for a message.
     * Can be overridden for custom prefix logic.
     * @since 0.2.6
     * @see {@link PeridotPrefixHook}
     * @example
     * ```typescript
     * // Database-based prefixes
     * client.fetchPrefix = async (message) => {
     *   const prefix = await db.getGuildPrefix(message.guild.id);
     *   return prefix ?? '!';
     * };
     * ```
     */
    public override fetchPrefix: PeridotPrefixHook;

    /**
     * Logger instance for framework and plugin logging.
     * @since 0.2.6
     */
    public override logger: Logger;

    /**
     * Whether mention prefixes are disabled.
     * @since 0.2.6
     * @default false
     */
    public disableMentionPrefix?: boolean;

    /**
     * Creates a new Peridot client instance.
     * @since 0.2.6
     * @param options - Client configuration options
     * @throws {Error} If the client is already initialized
     */
    public constructor(options: ClientOptions) {
        super(options);

        if (container.client) {
            throw new Error('PeridotClient already initialized, only one instance is allowed');
        }

        container.client = this;

        // Run pre-initialization plugins
        for (const plugin of PeridotClient.plugins.values(PluginHook.PreGenericsInitialization)) {
            plugin.hook.call(this, options);
            this.emit(Events.PluginLoaded, plugin.type, plugin.name);
        }

        // Initialize core components
        this.logger = options.logger;
        container.logger = options.logger;
        container.permissionConfig = options.permissionConfig;
        container.handlers = new HandlerRegistryManager();
        _registerBuiltInHandlerRegistries(container.handlers);

        this.fetchPrefix = options.fetchPrefix ?? (() => this.options.defaultPrefix ?? null);
        this.disableMentionPrefix = options.disableMentionPrefix;

        // Run initialization plugins
        for (const plugin of PeridotClient.plugins.values(PluginHook.PreInitialization)) {
            plugin.hook.call(this, options);
            this.emit(Events.PluginLoaded, plugin.type, plugin.name);
        }

        this.id = options.id ?? null;

        // Set client ID when ready
        this.once(Events.ClientReady, () => {
            this.id = this.user?.id ?? null;
        });

        _registerCoreEventHandlers(this);

        // Run post-initialization plugins
        for (const plugin of PeridotClient.plugins.values(PluginHook.PostInitialization)) {
            plugin.hook.call(this, options);
            this.emit(Events.PluginLoaded, plugin.type, plugin.name);
        }
    }

    /**
     * Logs in to Discord and initializes the client.
     * Runs plugins at various stages of the login process.
     * @since 0.2.6
     * @param token - Discord bot token
     * @returns Promise that resolves when logged in
     */
    public override async login(token?: string) {
        // Run pre-login plugins
        for (const plugin of PeridotClient.plugins.values(PluginHook.PreLogin)) {
            await plugin.hook.call(this, this.options);
            this.emit(Events.PluginLoaded, plugin.type, plugin.name);
        }

        const login = await super.login(token);

        // Run post-login plugins
        for (const plugin of PeridotClient.plugins.values(PluginHook.PostLogin)) {
            await plugin.hook.call(this, this.options);
            this.emit(Events.PluginLoaded, plugin.type, plugin.name);
        }

        return login;
    }

    /**
     * Plugin manager for the client.
     * @since 0.2.6
     */
    public static plugins = new PluginManager();

    /**
     * Registers a plugin with the client.
     * @since 0.2.6
     * @param plugin - Plugin class to register
     * @returns The client class for chaining
     */
    public static use(plugin: typeof Plugin) {
        this.plugins.use(plugin);
        return this;
    }
}

declare module 'discord.js' {
    interface Client {
        id: Snowflake | null;
        logger: Logger;
        fetchPrefix: PeridotPrefixHook;
    }

    interface ClientOptions extends PeridotClientOptions {}
}
