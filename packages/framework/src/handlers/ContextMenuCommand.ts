import type {
    ApplicationCommandType,
    MessageApplicationCommandData,
    MessageContextMenuCommandInteraction,
    Snowflake,
    UserApplicationCommandData,
    UserContextMenuCommandInteraction,
} from 'discord.js';

import type { CommonContext } from './index.js';

export type ContextMenuCommandContext<T extends Record<string, unknown> = Record<string, unknown>> = CommonContext & T;

export type ContextMenuCommand =
    | {
          type: ApplicationCommandType.User

          data: UserApplicationCommandData;
          guilds: Snowflake[] | 'global';

          run: UserContextMenuCommandRun;
      }
    | {
          type: ApplicationCommandType.Message;

          data: MessageApplicationCommandData;
          guilds: Snowflake[] | 'global';

          run: MessageContextMenuCommandRun;
      };

export type UserContextMenuCommandRun<T extends Record<string, unknown> = Record<string, unknown> > = (interaction: UserContextMenuCommandInteraction, ctx: ContextMenuCommandContext<T>) => Promise<void> | void;

export type MessageContextMenuCommandRun<T extends Record<string, unknown> = Record<string, unknown>> = (interaction: MessageContextMenuCommandInteraction, ctx: ContextMenuCommandContext<T>) => Promise<void> | void;
