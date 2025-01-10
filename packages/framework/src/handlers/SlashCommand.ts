import type {
    ApplicationCommandOption,
    ApplicationCommandOptionData,
    ApplicationCommandSubCommand,
    ApplicationCommandSubGroup,
    AutocompleteInteraction,
    CacheType,
    ChannelType,
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction,
    CommandInteractionOption,
    CommandInteractionOptionResolver,
    Snowflake,
} from 'discord.js';
import type { ApplicationCommandOptionType } from 'discord.js';

import type { CommonContext } from './index.js';

/**
 * Context object passed to slash command handlers.
 * @since 0.2.6
 * @category Commands
 * @template T - Additional context properties specific to this slash command
 */
export type SlashCommandContext<T extends Record<string, unknown> = Record<string, unknown>> = CommonContext & T;

/**
 * Function signature for slash command handlers.
 * @since 0.2.6
 * @category Commands
 * @template T - Additional context properties specific to this slash command
 * @example
 * ```typescript
 * const handler: SlashCommandRun = async (interaction, ctx) => {
 *   const input = interaction.options.getString('input', true);
 *   await interaction.reply(`You provided: ${input}`);
 * };
 * ```
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/ChatInputCommandInteraction}
 */
export type SlashCommandRun<T extends Record<string, unknown> = Record<string, unknown>> = (
    interaction: ChatInputCommandInteraction,
    ctx: SlashCommandContext<T>,
) => Promise<void>;

/**
 * Context object passed to autocomplete handlers.
 * @since 0.2.6
 * @category Commands
 * @template T - Additional context properties specific to this autocomplete handler
 */
export type AutoCompleteContext<T extends Record<string, unknown> = Record<string, unknown>> = CommonContext & T;

/**
 * Function signature for autocomplete handlers.
 * @since 0.2.6
 * @category Commands
 * @template T - Additional context properties specific to this autocomplete handler
 * @example
 * ```typescript
 * const handler: AutoCompleteRun = async (interaction, ctx) => {
 *   const focused = interaction.options.getFocused(true);
 *   await interaction.respond([
 *     { name: 'Option 1', value: 'option1' },
 *     { name: 'Option 2', value: 'option2' }
 *   ]);
 * };
 * ```
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/AutocompleteInteraction}
 */
export type AutoCompleteRun<T extends Record<string, unknown> = Record<string, unknown>> = (
    interaction: AutocompleteInteraction,
    ctx: AutoCompleteContext<T>,
) => Promise<void>;

/**
 * Represents a slash command handler.
 * @since 0.2.6
 * @category Commands
 * @example
 * ```typescript
 * const command: SlashCommand = {
 *   data: {
 *     name: 'echo',
 *     description: 'Repeats your input',
 *     options: [{
 *       name: 'input',
 *       description: 'The text to repeat',
 *       type: ApplicationCommandOptionType.String,
 *       required: true
 *     }]
 *   },
 *   guilds: 'global',
 *   run: async (interaction, ctx) => {
 *     const input = interaction.options.getString('input', true);
 *     await interaction.reply(input);
 *   }
 * };
 * ```
 * @requires Discord.js v14 or higher
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/ChatInputCommandInteraction}
 */
export type SlashCommand = {
    /**
     * Configuration data for the slash command.
     * Includes name, description, and options.
     * @see {@link https://discord.js.org/#/docs/discord.js/main/typedef/ChatInputApplicationCommandData}
     */
    data: ChatInputApplicationCommandData;

    /**
     * Specifies which guilds this command is available in.
     * - 'global': Available in all guilds
     * - Snowflake[]: Only available in the specified guilds
     */
    guilds: Snowflake[] | 'global';

    /**
     * The function to execute when the command is used.
     * @see {@link SlashCommandRun}
     */
    run: SlashCommandRun;

    /**
     * Optional handler for autocomplete interactions.
     * @see {@link AutoCompleteRun}
     */
    autocomplete?: AutoCompleteRun;
};

/**
 * Extracts option types from command data for type-safe option access.
 * @internal
 * @category Types
 */
type ExtractSlashCommandOptions<T extends ApplicationCommandOption[]> = {
    [K in ApplicationCommandOptionType]: Extract<T[number], { type: K }>['name'];
};

/**
 * Helper type for handling readonly arrays.
 * @internal
 * @category Types
 */
type MaybeReadonly<T> = Readonly<T> | T;

/**
 * Extracts valid subcommand paths from command structure.
 * @internal
 * @category Types
 */
type ExtractSlashCommandPaths<T extends MaybeReadonly<ApplicationCommandOptionData[]>> =
    T extends MaybeReadonly<[infer F, ...infer R]>
        ? F extends MaybeReadonly<ApplicationCommandSubGroup>
            ? F['options'] extends MaybeReadonly<ApplicationCommandSubCommand[]>
                ?
                      | `${F['name']}/${F['options'] extends readonly ApplicationCommandSubCommand[]
                            ? ExtractSlashCommandPaths<F['options']>
                            : never}`
                      | (R extends ApplicationCommandOptionData[] ? ExtractSlashCommandPaths<R> : never)
                : false
            : F extends ApplicationCommandSubCommand
              ? F['name'] | (R extends ApplicationCommandOptionData[] ? ExtractSlashCommandPaths<R> : never)
              : never
        : never;

/**
 * Type-safe wrapper for Discord.js option resolver with improved type inference.
 * @since 0.2.6
 * @category Types
 * @template Options - Array of command options to type against
 * @template Cached - Cache type for the interaction
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/CommandInteractionOptionResolver}
 */
type SlashCommandOptionsResolver<Options extends ApplicationCommandOption[], Cached extends CacheType = CacheType> = {
    getSubcommand(required?: true): ExtractSlashCommandOptions<Options>[ApplicationCommandOptionType.Subcommand];
    getSubcommand(required: boolean): ExtractSlashCommandOptions<Options>[ApplicationCommandOptionType.Subcommand] | null;
    getSubcommandGroup(required: true): ExtractSlashCommandOptions<Options>[ApplicationCommandOptionType.SubcommandGroup];
    getSubcommandGroup(required?: boolean): ExtractSlashCommandOptions<Options>[ApplicationCommandOptionType.SubcommandGroup] | null;
    getBoolean(name: ExtractSlashCommandOptions<Options>[ApplicationCommandOptionType.Boolean], required: true): boolean;
    getBoolean(name: ExtractSlashCommandOptions<Options>[ApplicationCommandOptionType.Boolean], required?: boolean): boolean | null;
    getChannel<const Type extends ChannelType = ChannelType>(
        name: ExtractSlashCommandOptions<Options>[ApplicationCommandOptionType.Channel],
        required: true,
        channelTypes?: readonly Type[],
    ): Extract<
        NonNullable<CommandInteractionOption<Cached>['channel']>,
        {
            type: Type extends ChannelType.PublicThread | ChannelType.AnnouncementThread
                ? ChannelType.PublicThread | ChannelType.AnnouncementThread
                : Type;
        }
    >;
    getChannel<const Type extends ChannelType = ChannelType>(
        name: ExtractSlashCommandOptions<Options>[ApplicationCommandOptionType.Channel],
        required?: boolean,
        channelTypes?: readonly Type[],
    ): Extract<
        NonNullable<CommandInteractionOption<Cached>['channel']>,
        {
            type: Type extends ChannelType.PublicThread | ChannelType.AnnouncementThread
                ? ChannelType.PublicThread | ChannelType.AnnouncementThread
                : Type;
        }
    > | null;
    getString(name: ExtractSlashCommandOptions<Options>[ApplicationCommandOptionType.String], required: true): string;
    getString(name: ExtractSlashCommandOptions<Options>[ApplicationCommandOptionType.String], required?: boolean): string | null;
    getInteger(name: ExtractSlashCommandOptions<Options>[ApplicationCommandOptionType.Integer], required: true): number;
    getInteger(name: ExtractSlashCommandOptions<Options>[ApplicationCommandOptionType.Integer], required?: boolean): number | null;
    getNumber(name: ExtractSlashCommandOptions<Options>[ApplicationCommandOptionType.Number], required: true): number;
    getNumber(name: ExtractSlashCommandOptions<Options>[ApplicationCommandOptionType.Number], required?: boolean): number | null;
    getUser(
        name: ExtractSlashCommandOptions<Options>[ApplicationCommandOptionType.User],
        required: true,
    ): NonNullable<CommandInteractionOption<Cached>['user']>;
    getUser(
        name: ExtractSlashCommandOptions<Options>[ApplicationCommandOptionType.User],
        required?: boolean,
    ): NonNullable<CommandInteractionOption<Cached>['user']> | null;
    getMember(
        name: ExtractSlashCommandOptions<Options>[ApplicationCommandOptionType.User],
    ): NonNullable<CommandInteractionOption<Cached>['member']> | null;
    getRole(
        name: ExtractSlashCommandOptions<Options>[ApplicationCommandOptionType.Role],
        required: true,
    ): NonNullable<CommandInteractionOption<Cached>['role']>;
    getRole(
        name: ExtractSlashCommandOptions<Options>[ApplicationCommandOptionType.Role],
        required?: boolean,
    ): NonNullable<CommandInteractionOption<Cached>['role']> | null;
    getAttachment(
        name: ExtractSlashCommandOptions<Options>[ApplicationCommandOptionType.Attachment],
        required: true,
    ): NonNullable<CommandInteractionOption<Cached>['attachment']>;
    getAttachment(
        name: ExtractSlashCommandOptions<Options>[ApplicationCommandOptionType.Attachment],
        required?: boolean,
    ): NonNullable<CommandInteractionOption<Cached>['attachment']> | null;
    getMentionable(
        name: ExtractSlashCommandOptions<Options>[ApplicationCommandOptionType.Mentionable],
        required: true,
    ): NonNullable<CommandInteractionOption<Cached>['member' | 'role' | 'user']>;
    getMentionable(
        name: ExtractSlashCommandOptions<Options>[ApplicationCommandOptionType.Mentionable],
        required?: boolean,
    ): NonNullable<CommandInteractionOption<Cached>['member' | 'role' | 'user']> | null;
} & Omit<CommandInteractionOptionResolver<Cached>, 'getMessage' | 'getFocused'>;

/**
 * Type-safe wrapper for Discord.js slash command interaction.
 * @since 0.2.6
 * @category Types
 * @template Options - Array of command options to type against
 * @template Cached - Cache type for the interaction
 * @see {@link https://discord.js.org/#/docs/discord.js/main/class/ChatInputCommandInteraction}
 */
type SlashCommandInteraction<Options extends ApplicationCommandOption[], Cached extends CacheType = CacheType> = {
    options: SlashCommandOptionsResolver<Options, Cached>;
} & ChatInputCommandInteraction<Cached>;
