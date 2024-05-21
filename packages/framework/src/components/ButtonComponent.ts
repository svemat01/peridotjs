import type { ButtonInteraction } from 'discord.js';

import type { CommonContext } from '../command/context.js';

export type ButtonComponentContext<T extends Record<string, unknown> = Record<string, unknown>> = CommonContext & T;

export type ButtonComponentRun<T extends Record<string, unknown> = Record<string, unknown>> = (
    interaction: ButtonInteraction,
    ctx: ButtonComponentContext<T>,
) => void | Promise<void>;

export type ButtonComponent = {
    customId: string | RegExp;
    run: ButtonComponentRun;
};
