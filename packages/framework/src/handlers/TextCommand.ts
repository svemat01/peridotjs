import type { Message, OmitPartialGroupDMChannel, Snowflake } from 'discord.js';

import type { FlagStrategyOptions } from '../arguments/FlagStrategy.js';
import type { Args } from '../arguments/Parser.js';
import type { PermissionLevel } from '../structures/permissions.js';
import type { CommonContext } from './index.js';

/**
 * Helper type to use narrowed message type in text command handlers.
 * Excludes partial group DM channel messages for type safety.
 * @since 0.2.6
 * @category Commands
 * @template InGuild - Whether the message is from a guild or DM
 */
export type TextCommandMessage<InGuild extends boolean = boolean> = OmitPartialGroupDMChannel<Message<InGuild>>;

/**
 * Configuration data for a text command.
 * @since 0.2.6
 * @category Commands
 */
export type TextCommandData = {
    /**
     * The primary name of the command used to invoke it.
     * @example 'help'
     */
    name: string;

    /**
     * A brief description of what the command does.
     * @example 'Shows information about available commands'
     */
    description: string;

    /**
     * Alternative names that can be used to invoke the command.
     * @example ['h', '?', 'commands']
     */
    aliases?: string[];

    /**
     * Whether the command can be used in DMs.
     * @default false
     */
    dm?: boolean;

    /**
     * Configuration for parsing command arguments and flags.
     * @see {@link FlagStrategyOptions}
     */
    strategy?: FlagStrategyOptions;

    /**
     * Specifies which guilds this command is available in.
     * - 'global': Available in all guilds
     * - 'trusted': Only available in trusted guilds
     * - Snowflake[]: Only available in the specified guilds
     */
    guilds: Snowflake[] | 'global' | 'trusted';

    /**
     * The permission level required to use this command.
     * @see {@link PermissionLevel}
     */
    permission: PermissionLevel;
};

/**
 * Context object passed to text command handlers.
 * @since 0.2.6
 * @category Commands
 * @template T - Additional context properties specific to this command
 */
export type TextCommandContext<T extends Record<string, unknown> = Record<string, unknown>> = CommonContext & {
    /**
     * Parsed arguments from the command message.
     * @see {@link Args}
     */
    args: Args;
} & T;

/**
 * Function signature for text command handlers.
 * @since 0.2.6
 * @category Commands
 * @template T - Additional context properties specific to this command
 * @example
 * ```typescript
 * const handler: TextCommandRun = async (msg, ctx) => {
 *   const arg = ctx.args.getString('input');
 *   await msg.reply(`You provided: ${arg}`);
 * };
 * ```
 */
export type TextCommandRun<T extends Record<string, unknown> = Record<string, unknown>> = (
    msg: TextCommandMessage,
    ctx: TextCommandContext & T,
) => Promise<void> | void;

/**
 * Represents a text command handler.
 * @since 0.2.6
 * @category Commands
 * @example
 * ```typescript
 * const command: TextCommand = {
 *   data: {
 *     name: 'ping',
 *     description: 'Check bot latency',
 *     aliases: ['p'],
 *     dm: true,
 *     guilds: 'global',
 *     permission: PermissionLevel.User
 *   },
 *   run: async (msg, ctx) => {
 *     await msg.reply('Pong!');
 *   }
 * };
 * ```
 * @requires Discord.js v14 or higher
 */
export type TextCommand = {
    /**
     * Configuration data for the command.
     * @see {@link TextCommandData}
     */
    data: TextCommandData;

    /**
     * The function to execute when the command is invoked.
     * @see {@link TextCommandRun}
     */
    run: TextCommandRun;
};
