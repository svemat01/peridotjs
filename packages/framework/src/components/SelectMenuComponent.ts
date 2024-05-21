import type { AnySelectMenuInteraction, SelectMenuType } from 'discord.js';

import type { CommonContext } from '../command/context.js';

export type SelectMenuComponentContext<T extends Record<string, unknown> = Record<string, unknown>> = CommonContext & T;

export type SelectMenuComponentRun<T extends SelectMenuType, C extends Record<string, unknown> = Record<string, unknown>> = (
    interaction: Extract<AnySelectMenuInteraction, { componentType: T }>,
    ctx: SelectMenuComponentContext<C>,
) => void | Promise<void>;

export type SelectMenuComponent<T extends SelectMenuType> = {
    customId: string | RegExp;
    type: T;
    run: SelectMenuComponentRun<T>;
};
