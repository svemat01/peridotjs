import type { AnySelectMenuInteraction, SelectMenuType } from 'discord.js';

import type { CommonContext } from './index.js';

/**
 * Context object passed to select menu component handlers.
 * @since 0.2.6
 * @category Components
 * @template T - Additional context properties specific to this select menu handler
 */
export type SelectMenuComponentContext<T extends Record<string, unknown> = Record<string, unknown>> = CommonContext & T;

/**
 * Function signature for select menu component handlers.
 * @since 0.2.6
 * @category Components
 * @template T - The type of select menu (String, User, Role, etc.)
 * @template C - Additional context properties specific to this select menu handler
 * @example
 * ```typescript
 * const handler: SelectMenuComponentRun<'STRING'> = async (interaction, ctx) => {
 *   const [selected] = interaction.values;
 *   await interaction.reply(`You selected: ${selected}`);
 * };
 * ```
 * @see {@link https://discord.js.org/#/docs/discord.js/main/typedef/AnySelectMenuInteraction}
 */
export type SelectMenuComponentRun<T extends SelectMenuType, C extends Record<string, unknown> = Record<string, unknown>> = (
    interaction: Extract<AnySelectMenuInteraction, { componentType: T }>,
    ctx: SelectMenuComponentContext<C>,
) => void | Promise<void>;

/**
 * Represents a select menu component handler.
 * @since 0.2.6
 * @category Components
 * @template T - The type of select menu (String, User, Role, etc.)
 * @example
 * ```typescript
 * const menu: SelectMenuComponent<'STRING'> = {
 *   customId: 'color-picker',
 *   type: 'STRING',
 *   run: async (interaction, ctx) => {
 *     const [color] = interaction.values;
 *     await interaction.reply(`You selected: ${color}`);
 *   }
 * };
 * ```
 * @requires Discord.js v14 or higher
 * @see {@link https://discord.js.org/#/docs/discord.js/main/typedef/AnySelectMenuInteraction}
 */
export type SelectMenuComponent<T extends SelectMenuType> = {
    /**
     * The custom ID of the select menu or a regex pattern to match against custom IDs.
     * Can be a string for exact matches or a RegExp for pattern matching.
     * @example 'role-selector'
     * @example /^team-select-\d+$/
     */
    customId: string | RegExp;

    /**
     * The type of select menu this handler is for.
     * Determines what kind of options can be selected (strings, users, roles, etc.).
     * @see {@link https://discord.js.org/#/docs/discord.js/main/typedef/SelectMenuType}
     */
    type: T;

    /**
     * The function to execute when an option is selected from the menu.
     * @see {@link SelectMenuComponentRun}
     */
    run: SelectMenuComponentRun<T>;
};
