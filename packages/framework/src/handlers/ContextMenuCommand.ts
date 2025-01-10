import type {
    ApplicationCommandType,
    MessageApplicationCommandData,
    MessageContextMenuCommandInteraction,
    Snowflake,
    UserApplicationCommandData,
    UserContextMenuCommandInteraction,
} from 'discord.js';

import type { CommonContext } from './index.js';

/**
 * Context object passed to context menu command handlers.
 * @since 0.2.6
 * @category Commands
 * @template T - Additional context properties specific to this context menu command
 */
export type ContextMenuCommandContext<T extends Record<string, unknown> = Record<string, unknown>> = CommonContext & T;

/**
 * Represents a context menu command handler.
 * Can be either a user context menu command or a message context menu command.
 * @since 0.2.6
 * @category Commands
 * @example
 * ```typescript
 * // User Context Menu Command
 * const userCommand: ContextMenuCommand = {
 *   type: ApplicationCommandType.User,
 *   data: {
 *     name: 'View Profile',
 *     type: ApplicationCommandType.User
 *   },
 *   guilds: 'global',
 *   run: async (interaction, ctx) => {
 *     const user = interaction.targetUser;
 *     await interaction.reply(`Viewing profile of ${user.tag}`);
 *   }
 * };
 *
 * // Message Context Menu Command
 * const messageCommand: ContextMenuCommand = {
 *   type: ApplicationCommandType.Message,
 *   data: {
 *     name: 'Report Message',
 *     type: ApplicationCommandType.Message
 *   },
 *   guilds: 'global',
 *   run: async (interaction, ctx) => {
 *     const message = interaction.targetMessage;
 *     await interaction.reply(`Reported message from ${message.author.tag}`);
 *   }
 * };
 * ```
 * @requires Discord.js v14 or higher
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/ContextMenuCommandInteraction}
 */
export type ContextMenuCommand =
    | {
          /**
           * Indicates this is a user context menu command.
           */
          type: ApplicationCommandType.User;

          /**
           * Configuration data for the user context menu command.
           * @see {@link https://discord.js.org/#/docs/discord.js/main/typedef/UserApplicationCommandData}
           */
          data: UserApplicationCommandData;

          /**
           * Specifies which guilds this command is available in.
           * - 'global': Available in all guilds
           * - Snowflake[]: Only available in the specified guilds
           */
          guilds: Snowflake[] | 'global';

          /**
           * The function to execute when the user context menu command is used.
           * @see {@link UserContextMenuCommandRun}
           */
          run: UserContextMenuCommandRun;
      }
    | {
          /**
           * Indicates this is a message context menu command.
           */
          type: ApplicationCommandType.Message;

          /**
           * Configuration data for the message context menu command.
           * @see {@link https://discord.js.org/#/docs/discord.js/main/typedef/MessageApplicationCommandData}
           */
          data: MessageApplicationCommandData;

          /**
           * Specifies which guilds this command is available in.
           * - 'global': Available in all guilds
           * - Snowflake[]: Only available in the specified guilds
           */
          guilds: Snowflake[] | 'global';

          /**
           * The function to execute when the message context menu command is used.
           * @see {@link MessageContextMenuCommandRun}
           */
          run: MessageContextMenuCommandRun;
      };

/**
 * Function signature for user context menu command handlers.
 * @since 0.2.6
 * @category Commands
 * @template T - Additional context properties specific to this context menu command
 * @example
 * ```typescript
 * const handler: UserContextMenuCommandRun = async (interaction, ctx) => {
 *   const user = interaction.targetUser;
 *   await interaction.reply(`Selected user: ${user.tag}`);
 * };
 * ```
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/UserContextMenuCommandInteraction}
 */
export type UserContextMenuCommandRun<T extends Record<string, unknown> = Record<string, unknown>> = (
    interaction: UserContextMenuCommandInteraction,
    ctx: ContextMenuCommandContext<T>,
) => Promise<void> | void;

/**
 * Function signature for message context menu command handlers.
 * @since 0.2.6
 * @category Commands
 * @template T - Additional context properties specific to this context menu command
 * @example
 * ```typescript
 * const handler: MessageContextMenuCommandRun = async (interaction, ctx) => {
 *   const message = interaction.targetMessage;
 *   await interaction.reply(`Selected message from: ${message.author.tag}`);
 * };
 * ```
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/MessageContextMenuCommandInteraction}
 */
export type MessageContextMenuCommandRun<T extends Record<string, unknown> = Record<string, unknown>> = (
    interaction: MessageContextMenuCommandInteraction,
    ctx: ContextMenuCommandContext<T>,
) => Promise<void> | void;
