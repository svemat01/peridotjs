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

import type { CommonContext } from './context.js';

export type SlashCommandContext<T extends Record<string, unknown> = Record<string, unknown>> = CommonContext & T;

export type SlashCommandRun<T extends Record<string, unknown> = Record<string, unknown>> = (
    interaction: ChatInputCommandInteraction,
    ctx: SlashCommandContext<T>,
) => Promise<void>;

export type AutoCompleteContext<T extends Record<string, unknown> = Record<string, unknown>> = CommonContext & T;

export type AutoCompleteRun<T extends Record<string, unknown> = Record<string, unknown>> = (
    interaction: AutocompleteInteraction,
    ctx: AutoCompleteContext<T>,
) => Promise<void>;

export type SlashCommand = {
    data: ChatInputApplicationCommandData;

    guilds: Snowflake[] | 'global';

    run: SlashCommandRun;

    autocomplete?: AutoCompleteRun;
};

// Extract the options from the data to an object keyed by type and valued by list of option names of that type
type ExtractSlashCommandOptions<T extends ApplicationCommandOption[]> = {
    [K in ApplicationCommandOptionType]: Extract<T[number], { type: K }>['name'];
};

type MaybeReadonly<T> = Readonly<T> | T;

// eslint-disable-next-line unused-imports/no-unused-vars
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
            // The `type` property of the PublicThreadChannel class is typed as `ChannelType.PublicThread | ChannelType.AnnouncementThread`
            // If the user only passed one of those channel types, the Extract<> would have resolved to `never`
            // Hence the need for this ternary
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
            // The `type` property of the PublicThreadChannel class is typed as `ChannelType.PublicThread | ChannelType.AnnouncementThread`
            // If the user only passed one of those channel types, the Extract<> would have resolved to `never`
            // Hence the need for this ternary
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

// eslint-disable-next-line unused-imports/no-unused-vars
type SlashCommandInteraction<Options extends ApplicationCommandOption[], Cached extends CacheType = CacheType> = {
    options: SlashCommandOptionsResolver<Options, Cached>;
} & ChatInputCommandInteraction<Cached>;
