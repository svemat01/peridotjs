import type { Awaitable, ClientOptions, Message, Snowflake } from 'discord.js';
import { Client, Events } from 'discord.js';
import type { i18n } from 'i18next';
import type { Logger } from 'pino';

import { container } from './container.js';
import type { PermissionLevelConfig } from './permissions.js';

/**
 * A valid prefix in Peridot.
 * * `string`: a single prefix, e.g. `'!'`.
 * * `string[]`: an array of prefixes, e.g. `['!', '.']`.
 * * `null`: disabled prefix, locks the bot's command usage to mentions only.
 */
export type PeridotPrefix = string | readonly string[] | null;

export type PeridotPrefixHook = {
    (message: Message): Awaitable<PeridotPrefix>;
};

export type PeridotClientOptions = {
    /**
     * The default prefix, in case of `null`, only mention prefix will trigger the bot's commands.
     * @since 1.0.0
     * @default null
     */
    defaultPrefix?: PeridotPrefix;

    /**
     * The regex prefix, an alternative to a mention or regular prefix to allow creating natural language command messages
     * @since 1.0.0
     * @example
     * ```typescript
     * /^(hey +)?bot[,! ]/i
     *
     * // Matches:
     * // - hey bot,
     * // - hey bot!
     * // - hey bot
     * // - bot,
     * // - bot!
     * // - bot
     * ```
     */
    regexPrefix?: RegExp;

    /**
     * The prefix hook, by default it is a callback function that returns {@link PeridotClientOptions.defaultPrefix}.
     * @since 1.0.0
     * @default () => client.options.defaultPrefix
     */
    fetchPrefix?: PeridotPrefixHook;

    /**
     * The client's ID, this is automatically set by the CoreReady event.
     * @since 1.0.0
     * @default this.client.user?.id ?? null
     */
    id?: Snowflake;

    /**
     * The logger options, defaults to an instance of {@link Logger} when {@link ClientLoggerOptions.instance} is not specified.
     * @since 1.0.0
     */
    logger: Logger;

    /**
     * i18n instance to be used by the framework and plugins.
     * If not provided, features that require i18n will throw an error.
     */
    i18n: i18n | undefined;

    /**
     * Controls whether the bot will automatically appear to be typing when a command is accepted.
     * @default false
     */
    typing?: boolean;

    // /**
    //  * Sets the default cooldown time for all commands.
    //  * @default "No cooldown options"
    //  */
    // defaultCooldown?: CooldownOptions;
    /**
     * Controls whether the bot has mention as a prefix disabled
     * @default false
     */
    disableMentionPrefix?: boolean;

    /**
     * Whenever starting the bot process Peridot may report errors when failing to fetch guild commands.
     * One of the causes for this can be when a bot was invited to a server without the `application.commands` scope.
     *
     * Normally this produce a log in the console at the WARN level, however because bot lists have a tendency to invite your
     * bot specifically without the scope to ensure that your Chat Input and Context Menu commands do not show up as usable commands
     * in that server, you may want to include their guild ids in this list.
     *
     * By adding ids to this list, whenever a guild id matches one of the ids in the list no warning log message will be emitted for that guild.
     *
     * By setting this value to `true`, no warning log message will be emitted for any guilds we couldn't fetch the commands from.
     *
     * Note that this specifically applies to the warning log:
     *
     * > ApplicationCommandRegistries: Failed to fetch guild commands for guild \<guild name\> (\<guild id\>). Make sure to authorize your application with the "applications.commands" scope in that guild.
     */
    preventFailedToFetchLogForGuilds?: string[] | true;

    permissionConfig: PermissionLevelConfig;
};

/**
 * The base {@link Client} extension that makes Peridot work. When building a Discord bot with the framework, the developer
 * must either use this class, or extend it.
 *
 * Peridot also automatically detects the folders to scan for pieces, please read {@link StoreRegistry.registerPath}
 * for reference. This method is called at the start of the {@link PeridotClient.login} method.
 *
 * @see {@link PeridotClientOptions} for all options available to the Peridot Client. You can also provide all of discord.js' [ClientOptions](https://discord.js.org/docs/packages/discord.js/main/ClientOptions:Interface)
 *
 * @since 1.0.0
 * @example
 * ```typescript
 * const client = new PeridotClient({
 *   presence: {
 *     activity: {
 *       name: 'for commands!',
 *       type: 'LISTENING'
 *     }
 *   }
 * });
 *
 * client.login(process.env.DISCORD_TOKEN)
 *   .catch(console.error);
 * ```
 *
 * @example
 * ```typescript
 * // Automatically scan from a specific directory, e.g. the main
 * // file is at `/home/me/bot/index.js` and all your pieces are at
 * // `/home/me/bot/pieces` (e.g. `/home/me/bot/pieces/commands/MyCommand.js`):
 * const client = new PeridotClient({
 *   baseUserDirectory: join(__dirname, 'pieces'),
 *   // More options...
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Opt-out automatic scanning:
 * const client = new PeridotClient({
 *   baseUserDirectory: null,
 *   // More options...
 * });
 * ```
 */
export class PeridotClient<Ready extends boolean = boolean> extends Client<Ready> {
    /**
     * The client's ID, used for the user prefix.
     * @since 1.0.0
     */
    public override id: Snowflake | null = null;

    /**
     * The method to be overridden by the developer.
     * @since 1.0.0
     * @return A string for a single prefix, an array of strings for matching multiple, or null for no match (mention prefix only).
     * @example
     * ```typescript
     * // Return always the same prefix (unconfigurable):
     * client.fetchPrefix = () => '!';
     * ```
     * @example
     * ```typescript
     * // Retrieving the prefix from a SQL database:
     * client.fetchPrefix = async (message) => {
     *   // note: driver is something generic and depends on how you connect to your database
     *   const guild = await driver.getOne('SELECT prefix FROM public.guild WHERE id = $1', [message.guild.id]);
     *   return guild?.prefix ?? '!';
     * };
     * ```
     * @example
     * ```typescript
     * // Retrieving the prefix from an ORM:
     * client.fetchPrefix = async (message) => {
     *   // note: driver is something generic and depends on how you connect to your database
     *   const guild = await driver.getRepository(GuildEntity).findOne({ id: message.guild.id });
     *   return guild?.prefix ?? '!';
     * };
     * ```
     */
    public override fetchPrefix: PeridotPrefixHook;

    /**
     * The logger to be used by the framework and plugins. By default, a {@link Logger} instance is used, which emits the
     * messages to the console.
     * @since 1.0.0
     */
    public override logger: Logger;

    /**
     * Whether the bot has mention as a prefix disabled
     * @default false
     * @example
     * ```typescript
     * client.disableMentionPrefix = false;
     * ```
     */
    public disableMentionPrefix?: boolean;

    public constructor(options: ClientOptions) {
        super(options);

        container.init(this, options.logger, options.i18n);
        container.permissionConfig = options.permissionConfig;

        this.logger = options.logger;

        this.fetchPrefix = options.fetchPrefix ?? (() => this.options.defaultPrefix ?? null);
        this.disableMentionPrefix = options.disableMentionPrefix;

        this.id = options.id ?? null;

        this.once(Events.ClientReady, () => {
            this.id = this.user?.id ?? null;
        });
    }
}

// export interface CooldownOptions {
// 	scope?: BucketScope;
// 	delay?: number;
// 	limit?: number;
// 	filteredUsers?: Snowflake[];
// 	filteredCommands?: string[];
// }

declare module 'discord.js' {
    interface Client {
        id: Snowflake | null;
        logger: Logger;
        fetchPrefix: PeridotPrefixHook;
    }

    interface ClientOptions extends PeridotClientOptions {}
}
