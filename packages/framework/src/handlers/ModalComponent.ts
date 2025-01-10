import type { ModalSubmitInteraction } from 'discord.js';

import type { CommonContext } from './index.js';

/**
 * Context object passed to modal component handlers.
 * @since 0.2.6
 * @category Components
 * @template T - Additional context properties specific to this modal handler
 */
export type ModalComponentContext<T extends Record<string, unknown> = Record<string, unknown>> = CommonContext & T;

/**
 * Function signature for modal component handlers.
 * @since 0.2.6
 * @category Components
 * @template T - Additional context properties specific to this modal handler
 * @example
 * ```typescript
 * const handler: ModalComponentRun = async (interaction, ctx) => {
 *   const input = interaction.fields.getTextInputValue('user-input');
 *   await interaction.reply(`You entered: ${input}`);
 *   return true;
 * };
 * ```
 * @returns A boolean indicating whether the modal submission was handled successfully
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/ModalSubmitInteraction}
 */
export type ModalComponentRun<T extends Record<string, unknown> = Record<string, unknown>> = (
    interaction: ModalSubmitInteraction,
    ctx: ModalComponentContext<T>,
) => boolean | Promise<boolean>;

/**
 * Represents a modal component handler.
 * @since 0.2.6
 * @category Components
 * @example
 * ```typescript
 * const modal: ModalComponent = {
 *   customId: 'user-feedback',
 *   run: async (interaction, ctx) => {
 *     const feedback = interaction.fields.getTextInputValue('feedback');
 *     await interaction.reply('Thank you for your feedback!');
 *     return true;
 *   }
 * };
 * ```
 * @requires Discord.js v14 or higher
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/ModalSubmitInteraction}
 */
export type ModalComponent = {
    /**
     * The custom ID of the modal or a regex pattern to match against custom IDs.
     * Can be a string for exact matches or a RegExp for pattern matching.
     * @example 'feedback-form'
     * @example /^edit-profile-\d+$/
     */
    customId: string | RegExp;

    /**
     * The function to execute when the modal is submitted.
     * @returns A boolean indicating whether the modal submission was handled successfully
     * @see {@link ModalComponentRun}
     */
    run: ModalComponentRun;
};
