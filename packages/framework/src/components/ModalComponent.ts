import type { ModalSubmitInteraction } from 'discord.js';

import type { CommonContext } from '../command/context.js';

export type ModalComponentContext<T extends Record<string, unknown> = Record<string, unknown>> = CommonContext & T;

export type ModalComponentRun<T extends Record<string, unknown> = Record<string, unknown>> = (
    interaction: ModalSubmitInteraction,
    ctx: ModalComponentContext<T>,
) => boolean | Promise<boolean>;

export type ModalComponent = {
    customId: string | RegExp;
    run: ModalComponentRun;
};
