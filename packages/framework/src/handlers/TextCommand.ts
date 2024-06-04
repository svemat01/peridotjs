import type { Message, Snowflake } from 'discord.js';

import type { FlagStrategyOptions } from '../arguments/FlagStrategy.js';
import type { Args } from '../arguments/Parser.js';
import type { PermissionLevel } from '../structures/permissions.js';
import type { CommonContext } from './index.js';

export type TextCommandData = {
    name: string;
    description: string;
    /**
     * Works in DMs?
     */
    dm?: boolean;

    /**
     * arguments options for flags and options
     */
    strategy?: FlagStrategyOptions;
    /**
     * Which guilds this command works in
     */
    guilds: Snowflake[] | 'global' | 'trusted';
    /**
     * The permission level required to run this command
     */
    permission: PermissionLevel;
};

export type TextCommandContext<T extends Record<string, unknown> = Record<string, unknown>> = CommonContext & {
    args: Args;
} & T;

export type TextCommandRun<T extends Record<string, unknown> = Record<string, unknown>> = (msg: Message, ctx: TextCommandContext & T) => Promise<void> | void;

export type TextCommand = {
    data: TextCommandData;
    run: TextCommandRun;
};
