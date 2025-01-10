import type { ButtonInteraction } from 'discord.js';

import type { CommonContext } from './index.js';

/**
 * Context object passed to button component handlers.
 * @since 0.2.6
 * @category Components
 * @template T - Additional context properties specific to this button handler
 */
export type ButtonComponentContext<T extends Record<string, unknown> = Record<string, unknown>> = CommonContext & T;

/**
 * Function signature for button component handlers.
 * @since 0.2.6
 * @category Components
 * @template T - Additional context properties specific to this button handler
 * @example
 * ```typescript
 * const handler: ButtonComponentRun = async (interaction, ctx) => {
 *   await interaction.reply('Button clicked!');
 * };
 * ```
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/ButtonInteraction}
 */
export type ButtonComponentRun<T extends Record<string, unknown> = Record<string, unknown>> = (
    interaction: ButtonInteraction,
    ctx: ButtonComponentContext<T>,
) => void | Promise<void>;

/**
 * Represents a button component handler.
 * @since 0.2.6
 * @category Components
 * @example
 * ```typescript
 * const button: ButtonComponent = {
 *   customId: 'confirm-action',
 *   run: async (interaction, ctx) => {
 *     await interaction.reply('Action confirmed!');
 *   }
 * };
 * ```
 * @requires Discord.js v14 or higher
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/ButtonInteraction}
 */
export type ButtonComponent = {
    /**
     * The custom ID of the button or a regex pattern to match against custom IDs.
     * Can be a string for exact matches or a RegExp for pattern matching.
     * @example 'confirm-button'
     * @example /^delete-\d+$/
     */
    customId: string | RegExp;

    /**
     * The function to execute when the button is clicked.
     * @see {@link ButtonComponentRun}
     */
    run: ButtonComponentRun;
};
