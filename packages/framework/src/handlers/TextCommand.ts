import { type Message, type OmitPartialGroupDMChannel, type Snowflake } from 'discord.js';

import type { FlagStrategyOptions } from '../arguments/FlagStrategy.js';
import type { Args, ArgType } from '../arguments/Parser.js';
import { UserError } from '../errors/UserError.js';
import type { PermissionLevel } from '../structures/permissions.js';
import type { CommonContext } from './index.js';

/**
 * Helper type to use narrowed message type in text command handlers.
 * Excludes partial group DM channel messages for type safety.
 * @since 0.2.6
 * @category Commands
 * @template InGuild - Whether the message is from a guild or DM
 */
export type TextCommandMessage<InGuild extends boolean = boolean> = OmitPartialGroupDMChannel<Message<InGuild>>;

/**
 * Configuration data for a text command.
 * @since 0.2.6
 * @category Commands
 */
export interface TextCommandData {
    /**
     * The primary name of the command used to invoke it.
     * @example 'help'
     */
    name: string;

    /**
     * A brief description of what the command does.
     * @example 'Shows information about available commands'
     */
    description: string;

    /**
     * Alternative names that can be used to invoke the command.
     * @example ['h', '?', 'commands']
     */
    aliases?: string[];

    /**
     * Whether the command can be used in DMs.
     * @default false
     */
    dm?: boolean;

    /**
     * Configuration for parsing command arguments and flags.
     * @see {@link FlagStrategyOptions}
     */
    strategy?: FlagStrategyOptions;

    /**
     * Specifies which guilds this command is available in.
     * - 'global': Available in all guilds
     * - Snowflake[]: Only available in the specified guilds
     */
    guilds: Snowflake[] | 'global';

    /**
     * The permission level required to use this command.
     * @see {@link PermissionLevel}
     */
    permission: PermissionLevel;
}

/**
 * Context object passed to text command handlers.
 * @since 0.2.6
 * @category Commands
 * @template T - Additional context properties specific to this command
 */
export interface TextCommandContext extends CommonContext {
    /**
     * Parsed arguments from the command message.
     * @see {@link Args}
     */
    args: Args;
}

export interface TextCommandBase {
    /**
     * Configuration data for the command.
     * @see {@link TextCommandData}
     */
    data: TextCommandData;

    /**
     * A function to handle errors that occur during the command execution.
     * @param error The error that occurred
     * @param ctx The command context
     */
    onError?: (error: unknown, ctx: TextCommandContext) => Promise<void> | void;
}

/**
 * Function signature for text command handlers.
 * @since 0.2.6
 * @category Commands
 * @template T - Additional context properties specific to this command
 * @example
 * ```typescript
 * const handler: TextCommandRun = async (msg, ctx) => {
 *   const arg = ctx.args.getString('input');
 *   await msg.reply(`You provided: ${arg}`);
 * };
 * ```
 */
export type TextCommandRun<T extends Record<string, unknown> = Record<string, unknown>> = (
    msg: TextCommandMessage,
    ctx: TextCommandContext & T,
) => Promise<void> | void;

/**
 * Represents a text command handler.
 * @since 0.2.6
 * @category Commands
 * @example
 * ```typescript
 * const command: TextCommand = {
 *   data: {
 *     name: 'ping',
 *     description: 'Check bot latency',
 *     aliases: ['p'],
 *     dm: true,
 *     guilds: 'global',
 *     permission: PermissionLevel.User
 *   },
 *   run: async (msg, ctx) => {
 *     await msg.reply('Pong!');
 *   }
 * };
 * ```
 * @requires Discord.js v14 or higher
 */
export interface TextCommand extends TextCommandBase {
    /**
     * The function to execute when the command is invoked.
     * @see {@link TextCommandRun}
     */
    run: TextCommandRun;
}

/**
 * Represents an argument for a subcommand.
 * @since 0.3.0
 * @category Commands
 * @template TType - The type of the argument from ArgType
 */
export type SubCommandArgument<TType extends keyof ArgType = keyof ArgType> = {
    /**
     * The name of the argument.
     * @example 'message'
     */
    name: string;

    /**
     * The type of the argument.
     * @example 'string'
     */
    type: TType;

    /**
     * A description of what the argument is for.
     * @example 'The commit message to use'
     */
    description: string;

    /**
     * The default value for this argument if not provided.
     * If not set and required is false, the argument will be undefined.
     */
    default?: ArgType[TType];

    /**
     * Whether this argument must be provided.
     * @default true
     */
    required?: boolean;
};

/**
 * Represents a flag with possible aliases.
 * @since 0.3.0
 * @category Commands
 */
export interface CommandFlag {
    /**
     * The primary name of the flag.
     * @example 'force'
     */
    name: string;

    /**
     * Alternative names for this flag.
     * @example ['f']
     */
    aliases?: string[];

    /**
     * A description of what the flag does.
     * @example 'Force the operation without confirmation'
     */
    description: string;
}

/**
 * Represents an option with possible aliases.
 * @since 0.3.0
 * @category Commands
 */
export interface CommandOption extends CommandFlag {
    /**
     * The hint for this option.
     * @example 'message'
     */
    hint: string;
}

/**
 * Base interface for all subcommands.
 * @since 0.3.0
 * @category Commands
 */
export interface SubcommandBase {
    /**
     * The name of the subcommand.
     * @example 'add'
     */
    name: string;

    /**
     * A description of what the subcommand does.
     * @example 'Add a new remote repository'
     */
    description: string;

    /**
     * Whether this is the default subcommand when none is specified.
     * Only one subcommand in a group should be marked as default.
     * @default false
     */
    default?: boolean;

    /**
     * Alternative names for this subcommand.
     * @example ['a', 'new']
     */
    aliases?: string[];

    /**
     * The options this subcommand accepts.
     * Options are key-value pairs prefixed with --.
     * Each option can have aliases and a description.
     * @example [{ name: 'branch', aliases: ['b'], description: 'The branch to use' }]
     */
    options?: CommandOption[];

    /**
     * The flags this subcommand accepts.
     * Flags are boolean values prefixed with --.
     * Each flag can have aliases and a description.
     * @example [{ name: 'force', aliases: ['f'], description: 'Force the operation' }]
     */
    flags?: CommandFlag[];

    /**
     * The permission level required to use this subcommand.
     * If not set, inherits from the parent command.
     */
    permission?: PermissionLevel;

    /**
     * A custom function to determine if a user can use this subcommand.
     * This is called after checking the permission level.
     * @param msg - The message that triggered the command
     * @param ctx - The command context
     * @returns A boolean indicating if the user can use this subcommand, or a string with the error message if they cannot
     */
    canRun?: (msg: TextCommandMessage, ctx: TextCommandContext) => Promise<boolean | string> | boolean | string;
}

/**
 * Represents a subcommand that can be executed (has no further subcommands).
 * @since 0.3.0
 * @category Commands
 */
export interface ExecutableSubcommand extends SubcommandBase {
    /**
     * The function to execute when this subcommand is invoked.
     */
    run: TextCommandRun;

    /**
     * The arguments this subcommand accepts.
     */
    arguments?: SubCommandArgument[];
}

/**
 * Represents a subcommand that contains other subcommands.
 * @since 0.3.0
 * @category Commands
 * @example
 * ```typescript
 * const remoteCommand: GroupSubcommand = {
 *   name: 'remote',
 *   description: 'Manage remote repositories',
 *   subcommands: [
 *     {
 *       name: 'add',
 *       description: 'Add a new remote',
 *       run: async (msg, ctx) => { ... }
 *     }
 *   ]
 * };
 * ```
 */
export interface GroupSubcommand extends SubcommandBase {
    /**
     * The subcommands this command contains.
     */
    subcommands: Array<ExecutableSubcommand | GroupSubcommand>;
}

/**
 * Represents either an executable subcommand or a group subcommand.
 * @since 0.3.0
 * @category Commands
 */
export type Subcommand = ExecutableSubcommand | GroupSubcommand;

/**
 * Represents a command that uses the subcommand system.
 * @since 0.3.0
 * @category Commands
 * @template TData - The type of the command data
 * @template TSubCommand - The type of subcommands this command uses
 * @example
 * ```typescript
 * const gitCommand: GroupTextCommand = {
 *   data: {
 *     name: 'git',
 *     description: 'Git command system',
 *     guilds: 'global',
 *     permission: 'user'
 *   },
 *   subcommands: [
 *     {
 *       name: 'commit',
 *       description: 'Commit changes',
 *       arguments: [
 *         {
 *           name: 'message',
 *           type: 'string',
 *           description: 'The commit message',
 *           required: true
 *         }
 *       ],
 *       run: async (msg, ctx) => {
 *         const message = await ctx.args.pick('string');
 *         await msg.reply(`Committing with message: ${message}`);
 *       }
 *     }
 *   ]
 * };
 * ```
 */
export interface GroupTextCommand extends TextCommandBase {
    /**
     * The subcommands this command contains.
     * @see {@link Subcommand}
     */
    subcommands: Subcommand[];
}

const generateHelp = (rootCommand: GroupTextCommand, subcommandPath: string[] = []): string[] => {
    const command = findSubcommandByPath(rootCommand, subcommandPath);

    if (!command) {
        return [`Invalid subcommand path: ${subcommandPath.join(' ')}`];
    }

    const pathString = subcommandPath.length > 0 ? ` ${subcommandPath.join(' ')}` : '';

    const isExecutable = 'run' in command;
    const isGroup = 'subcommands' in command && !('data' in command);
    const isRoot = 'data' in command;
    // Build the help message
    // let helpText = '```\n';
    const lines: string[] = [];

    // Usage section
    let usage = '';
    usage += `Usage: ${rootCommand.data.name}${pathString}`;

    if (!isExecutable) {
        usage += ' <subcommand>';
    } else {
        if (command.arguments?.length) {
            for (const arg of command.arguments) {
                const argName = arg.required !== false ? `<${arg.name}>` : `[${arg.name}]`;
                usage += ` ${argName}`;
            }
        }
    }

    usage += ' [options...]';
    lines.push(usage, '');

    // Description
    if (isExecutable || isGroup) {
        lines.push(`${command.description}`, '');
    } else {
        lines.push(`${rootCommand.data.description}`, '');
    }

    // Subcommands section (only if not an executable command)
    if (!isExecutable) {
        lines.push('Subcommands:');
        const maxNameLength = Math.max(...command.subcommands.map((cmd) => cmd.name.length));

        for (const subcommand of command.subcommands) {
            const nameWithPadding = subcommand.name.padEnd(maxNameLength + 2);
            const defaultMarker = subcommand.default ? ' (default)' : '';
            lines.push(`  ${nameWithPadding}    ${subcommand.description}${defaultMarker}`);

            if (subcommand.aliases?.length) {
                const aliasText = subcommand.aliases.join(', ');
                lines.push(`  ${' '.repeat(maxNameLength + 2)}    Aliases: ${aliasText}`);
            }
        }

        lines.push('', 'Use "--help <subcommand>" for more information about a command.');
    }

    // Arguments section
    if (isExecutable && command.arguments?.length) {
        lines.push('Arguments:');
        const maxArgLength = Math.max(...command.arguments.map((arg) => arg.name.length));

        for (const arg of command.arguments) {
            const nameWithPadding = arg.name.padEnd(maxArgLength);
            const valueType = arg.required !== false ? `<${arg.type}>` : `[${arg.type}]`;
            lines.push(`  ${nameWithPadding}  ${valueType}  ${arg.description}`);

            if (arg.default !== undefined) {
                lines.push(`  ${' '.repeat(maxArgLength + valueType.length + 3)}    Default: ${arg.default}`);
            }
        }
    }

    // Combined Options and Flags section
    const hasOptions = !isRoot && command.options?.length;
    const hasFlags = !isRoot && command.flags?.length;

    if (hasOptions || hasFlags) {
        lines.push('Options:');

        // Combine options and flags, sort by name
        const allOptions = [
            ...(command.options ?? []).map((opt) => ({
                ...opt,
                type: opt.hint ? `<${opt.hint}>` : '',
                isOption: true,
            })),
            ...(command.flags ?? []).map((flag) => ({
                ...flag,
                type: '',
                isOption: false,
            })),
        ].sort((a, b) => a.name.localeCompare(b.name));

        // Calculate padding based on longest option name and type
        const maxNameLength = Math.max(...allOptions.map((opt) => opt.name.length));
        const maxTypeLength = Math.max(...allOptions.map((opt) => opt.type.length));

        for (const opt of allOptions) {
            const shortAlias = opt.aliases?.[0];
            const prefix = shortAlias ? ` -${shortAlias}, ` : '     ';
            const name = `--${opt.name}`;
            const nameWithPadding = name.padEnd(maxNameLength + 2);
            const typeWithPadding = opt.type.padEnd(maxTypeLength);

            let option = `${prefix}${nameWithPadding} ${typeWithPadding}    ${opt.description}`;

            // Add remaining aliases if any
            if (opt.aliases && opt.aliases.length > 1) {
                const remainingAliases = opt.aliases.slice(1);
                if (remainingAliases.length > 0) {
                    option += ` (also: ${remainingAliases.map((a) => `-${a}`).join(', ')})`;
                }
            }
            lines.push(option);
        }
    }

    return lines;
};

const findSubcommandByPath = (subcommand: Subcommand | GroupTextCommand, path: string[]): Subcommand | GroupTextCommand | null => {
    if (path.length === 0) return subcommand;

    const [current, ...rest] = path;
    if (!current) return null;

    if ('run' in subcommand) return subcommand;

    const found = subcommand.subcommands.find((cmd) => cmd.name === current || cmd.aliases?.includes(current));

    if (!found) return null;
    return findSubcommandByPath(found, rest);
};

const findSubcommand = (subcommands: Subcommand[], name: string): Subcommand | undefined => {
    return subcommands.find((cmd) => cmd.name === name || cmd.aliases?.includes(name));
};

/**
 * Creates a TextCommand from either a regular TextCommand or a GroupTextCommand.
 * If a GroupTextCommand is provided, it will be transformed into a TextCommand with subcommand handling.
 * @since 0.3.0
 * @category Commands
 * @param command - The command to create
 * @returns A TextCommand that can be registered with the framework
 */
export const createTextCommand = <T extends TextCommand | GroupTextCommand>(command: T): TextCommand => {
    if (!('subcommands' in command)) {
        return command;
    }

    const { data: commandData, subcommands, ...rest } = command;

    return {
        ...rest,
        data: {
            ...commandData,
            strategy: {
                flags: true,
                options: true,
                ...commandData.strategy,
            },
        },
        async run(...props) {
            const [msg, ctx] = props;
            const args = ctx.args;

            let currentSubcommands = subcommands;
            const subcommandPath: string[] = [];
            let currentSubcommand: Subcommand | undefined;

            // Walk through the subcommand tree
            while (!args.finished) {
                args.save();
                const next = args.nextMaybe().unwrapOr(undefined);
                if (!next) {
                    args.restore();
                    break;
                }

                const found = findSubcommand(currentSubcommands, next);
                if (!found) {
                    // If we don't find a matching subcommand, restore the parser to before this argument
                    // This way the argument can be used by the command's run function
                    args.restore();
                    break;
                }

                // Check permissions before accepting the subcommand
                if (found.permission && found.permission > commandData.permission) {
                    throw new UserError({
                        identifier: 'insufficient_permissions',
                        message: `You don't have permission to use the \`${found.name}\` subcommand.`,
                    });
                }

                if (found.canRun) {
                    const canRun = await found.canRun(msg, ctx);
                    if (typeof canRun === 'string') {
                        throw new UserError({
                            identifier: 'cannot_run_subcommand',
                            message: canRun,
                        });
                    }
                    if (!canRun) {
                        throw new UserError({
                            identifier: 'cannot_run_subcommand',
                            message: `You cannot use the \`${found.name}\` subcommand.`,
                        });
                    }
                }

                args.discard();
                subcommandPath.push(next);
                currentSubcommand = found;

                if ('run' in found) {
                    // If this is a leaf command, stop parsing subcommands
                    // The remaining arguments will be used by the command's run function
                    break;
                } else {
                    currentSubcommands = found.subcommands;
                }
            }

            // Handle help flag after we've resolved the subcommand path
            if (args.hasFlags('help', 'h')) {
                const helpLines = generateHelp(command, subcommandPath);

                // Split into multiple messages if needed (Discord 2000 char limit)
                const blocks: string[] = [];
                let currentMessage = '';

                // Find good split points (at newlines) while respecting Discord limits
                for (const line of helpLines) {
                    if (currentMessage.length + line.length > 1950) {
                        blocks.push(currentMessage);
                        currentMessage = '';
                    }

                    currentMessage += line + '\n';
                }

                if (currentMessage) {
                    blocks.push(currentMessage);
                }

                // Send all messages
                let previousMessage = msg;
                for (const block of blocks) {
                    previousMessage = await previousMessage.reply('```\n' + block + '\n```');
                }
                return;
            }

            // If no subcommand was found, look for a default one
            if (!currentSubcommand) {
                currentSubcommand = currentSubcommands.find((cmd) => cmd.default);

                if (!currentSubcommand) {
                    throw new UserError({
                        identifier: 'subcommand_required',
                        message: `This command requires a subcommand. Use \`${commandData.name} --help\` to see available subcommands.`,
                    });
                }
            }

            // Execute the found subcommand
            if ('run' in currentSubcommand) {
                await currentSubcommand.run(...props);
                return;
            } else {
                const commandPath = subcommandPath.length > 0 ? ` ${subcommandPath.join(' ')}` : '';
                throw new UserError({
                    identifier: 'invalid_subcommand',
                    message: `Please specify a valid subcommand. Use \`${commandData.name}${commandPath} --help\` to see available subcommands.`,
                });
            }
        },
    };
};

export const createSubcommand = <T extends Subcommand>(command: T): T => command;
