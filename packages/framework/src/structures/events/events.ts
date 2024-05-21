import {
    type AnySelectMenuInteraction,
    AutocompleteInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    Colors,
    ContextMenuCommandInteraction,
    EmbedBuilder,
    Events as DJSEvents,
    type Message,
    ModalSubmitInteraction,
    type SelectMenuType,
} from 'discord.js';
import type { Logger } from 'pino';

import { UserError } from '../../errors/UserError.js';
import type {
    ButtonComponent as PeridotButtonComponent,
    ContextMenuCommand,
    ModalComponent,
    SelectMenuComponent,
    SlashCommand,
    TextCommand,
} from '../../index.js';
import { container } from '../container.js';
import {
    onButtonInteractionAccepted,
    onContextMenuCommandAccepted,
    onModalSubmitInteractionAccepted,
    onPossibleButtonInteraction,
    onPossibleContextMenuCommand,
    onPossibleModalSubmitInteraction,
    onPossibleSelectMenuInteraction,
    onPossibleSlashCommand,
    onPreButtonInteractionRun,
    onPreContextMenuCommandRun,
    onPreModalSubmitInteractionRun,
    onPreSelectMenuInteractionRun,
    onPreSlashCommandRun,
    onSelectMenuInteractionAccepted,
    onSlashCommandAccepted,
} from './interaction/index.js';
import { onInteractionCreate } from './interaction/interactionCreate.js';
import { onMessageCreate } from './text/messageCreate.js';
import { onPrefixedMessage } from './text/prefixedMessage.js';
import { preTextCommandRun } from './text/preTextCommandRun.js';
import { onTextCommandAccepted } from './text/textCommandAccepted.js';

export const Events = {
    // #region Discord.js base events
    ApplicationCommandPermissionsUpdate: DJSEvents.ApplicationCommandPermissionsUpdate as const,
    AutoModerationActionExecution: DJSEvents.AutoModerationActionExecution as const,
    AutoModerationRuleCreate: DJSEvents.AutoModerationRuleCreate as const,
    AutoModerationRuleDelete: DJSEvents.AutoModerationRuleDelete as const,
    AutoModerationRuleUpdate: DJSEvents.AutoModerationRuleUpdate as const,
    CacheSweep: DJSEvents.CacheSweep as const,
    ChannelCreate: DJSEvents.ChannelCreate as const,
    ChannelDelete: DJSEvents.ChannelDelete as const,
    ChannelPinsUpdate: DJSEvents.ChannelPinsUpdate as const,
    ChannelUpdate: DJSEvents.ChannelUpdate as const,
    ClientReady: DJSEvents.ClientReady as const,
    Debug: DJSEvents.Debug as const,
    Error: DJSEvents.Error as const,
    GuildAuditLogEntryCreate: DJSEvents.GuildAuditLogEntryCreate as const,
    GuildAvailable: DJSEvents.GuildAvailable as const,
    GuildBanAdd: DJSEvents.GuildBanAdd as const,
    GuildBanRemove: DJSEvents.GuildBanRemove as const,
    GuildCreate: DJSEvents.GuildCreate as const,
    GuildDelete: DJSEvents.GuildDelete as const,
    GuildEmojiCreate: DJSEvents.GuildEmojiCreate as const,
    GuildEmojiDelete: DJSEvents.GuildEmojiDelete as const,
    GuildEmojiUpdate: DJSEvents.GuildEmojiUpdate as const,
    GuildIntegrationsUpdate: DJSEvents.GuildIntegrationsUpdate as const,
    GuildMemberAdd: DJSEvents.GuildMemberAdd as const,
    GuildMemberAvailable: DJSEvents.GuildMemberAvailable as const,
    GuildMemberRemove: DJSEvents.GuildMemberRemove as const,
    GuildMembersChunk: DJSEvents.GuildMembersChunk as const,
    GuildMemberUpdate: DJSEvents.GuildMemberUpdate as const,
    GuildRoleCreate: DJSEvents.GuildRoleCreate as const,
    GuildRoleDelete: DJSEvents.GuildRoleDelete as const,
    GuildRoleUpdate: DJSEvents.GuildRoleUpdate as const,
    GuildScheduledEventCreate: DJSEvents.GuildScheduledEventCreate as const,
    GuildScheduledEventDelete: DJSEvents.GuildScheduledEventDelete as const,
    GuildScheduledEventUpdate: DJSEvents.GuildScheduledEventUpdate as const,
    GuildScheduledEventUserAdd: DJSEvents.GuildScheduledEventUserAdd as const,
    GuildScheduledEventUserRemove: DJSEvents.GuildScheduledEventUserRemove as const,
    GuildStickerCreate: DJSEvents.GuildStickerCreate as const,
    GuildStickerDelete: DJSEvents.GuildStickerDelete as const,
    GuildStickerUpdate: DJSEvents.GuildStickerUpdate as const,
    GuildUnavailable: DJSEvents.GuildUnavailable as const,
    GuildUpdate: DJSEvents.GuildUpdate as const,
    InteractionCreate: DJSEvents.InteractionCreate as const,
    Invalidated: DJSEvents.Invalidated as const,
    InviteCreate: DJSEvents.InviteCreate as const,
    InviteDelete: DJSEvents.InviteDelete as const,
    MessageBulkDelete: DJSEvents.MessageBulkDelete as const,
    MessageCreate: DJSEvents.MessageCreate as const,
    MessageDelete: DJSEvents.MessageDelete as const,
    MessageReactionAdd: DJSEvents.MessageReactionAdd as const,
    MessageReactionRemove: DJSEvents.MessageReactionRemove as const,
    MessageReactionRemoveAll: DJSEvents.MessageReactionRemoveAll as const,
    MessageReactionRemoveEmoji: DJSEvents.MessageReactionRemoveEmoji as const,
    MessageUpdate: DJSEvents.MessageUpdate as const,
    PresenceUpdate: DJSEvents.PresenceUpdate as const,
    Raw: DJSEvents.Raw as const,
    ShardDisconnect: DJSEvents.ShardDisconnect as const,
    ShardError: DJSEvents.ShardError as const,
    ShardReady: DJSEvents.ShardReady as const,
    ShardReconnecting: DJSEvents.ShardReconnecting as const,
    ShardResume: DJSEvents.ShardResume as const,
    StageInstanceCreate: DJSEvents.StageInstanceCreate as const,
    StageInstanceDelete: DJSEvents.StageInstanceDelete as const,
    StageInstanceUpdate: DJSEvents.StageInstanceUpdate as const,
    ThreadCreate: DJSEvents.ThreadCreate as const,
    ThreadDelete: DJSEvents.ThreadDelete as const,
    ThreadListSync: DJSEvents.ThreadListSync as const,
    ThreadMembersUpdate: DJSEvents.ThreadMembersUpdate as const,
    ThreadMemberUpdate: DJSEvents.ThreadMemberUpdate as const,
    ThreadUpdate: DJSEvents.ThreadUpdate as const,
    TypingStart: DJSEvents.TypingStart as const,
    UserUpdate: DJSEvents.UserUpdate as const,
    VoiceServerUpdate: DJSEvents.VoiceServerUpdate as const,
    VoiceStateUpdate: DJSEvents.VoiceStateUpdate as const,
    Warn: DJSEvents.Warn as const,
    WebhooksUpdate: DJSEvents.WebhooksUpdate as const,
    // #endregion Discord.js base events

    // #region Custom events
    // #region Text commands chain
    /**
     * Emitted when a message is created that was not sent by bots or webhooks.
     * @param {Message} message The created message
     */
    PreMessageParsed: 'preMessageParsed' as const,
    /**
     * Emitted when a message is created consisting of only the bot's mention.
     * @param {Message} message The created message
     */
    MentionPrefixOnly: 'mentionPrefixOnly' as const,
    /**
     * Emitted when a message is created that does not start with a valid prefix.
     * @param {Message} message The created message
     */
    NonPrefixedMessage: 'nonPrefixedMessage' as const,
    /**
     * Emitted when a message is created that does starts with a valid prefix.
     * @param {Message} message The created message
     */
    PrefixedMessage: 'prefixedMessage' as const,

    /**
     * Emitted when a message starts with a valid prefix but does not include a command name.
     * @param {UnknownTextCommandNamePayload} payload
     */
    UnknownTextCommandName: 'unknownTextCommandName' as const,
    /**
     * Emitted when the name of a sent text command does not match any loaded commands.
     * @param {UnknownTextCommandPayload} payload The contextual payload
     */
    UnknownTextCommand: 'unknownTextCommand' as const,

    /**
     * Emitted before the `messageRun` method of a command is run.
     * @param {PreTextCommandRunPayload} payload The contextual payload
     */
    PreTextCommandRun: 'preTextCommandRun' as const,

    /**
     * Emitted when a precondition denies a text command from being run.
     * @param {UserError} error The error reported by the precondition
     * @param {TextCommandDeniedPayload} payload The contextual payload
     */
    TextCommandDenied: 'textCommandDenied' as const,
    /**
     * Emitted when a text command passes all precondition checks, if any.
     * @param {TextCommandAcceptedPayload} payload The contextual payload
     */
    TextCommandAccepted: 'textCommandAccepted' as const,

    /**
     * Emitted directly before a text command is run.
     * @param {Message} message The message that executed the command
     * @param {Command} command The command that is being run
     * @param {TextCommandRunPayload} payload The contextual payload
     */
    TextCommandRun: 'textCommandRun' as const,
    /**
     * Emitted after a text command runs successfully.
     * @param {TextCommandSuccessPayload} payload The contextual payload
     */
    TextCommandSuccess: 'textCommandSuccess' as const,
    /**
     * Emitted after a text command runs unsuccesfully.
     * @param {*} error The error that was thrown
     * @param {TextCommandErrorPayload} payload The contextual payload
     */
    TextCommandError: 'textCommandError' as const,
    /**
     * Emitted directly after a text command finished running, regardless of the outcome.
     * @param {Message} message The message that executed the command
     * @param {Command} command The command that finished running
     * @param {TextCommandFinishPayload} payload The contextual payload
     */
    TextCommandFinish: 'textCommandFinish' as const,
    // #endregion Text commands chain

    // #region Autocomplete interaction
    /**
     * Emitted when an autocomplete interaction is received.
     * @param {AutocompleteInteraction} interaction The interaction that was received
     */
    PossibleAutocompleteInteraction: 'possibleAutocompleteInteraction' as const,
    /**
     * Emitted after an autocomplete interaction handler runs successfully.
     * @param {AutocompleteInteractionSuccessPayload} payload The contextual payload
     */
    AutocompleteInteractionSuccess: 'autocompleteInteractionSuccess' as const,
    /**
     * Emitted when an error is encountered when executing an autocomplete interaction handler.
     * @param {*} error The error that was encountered
     * @param {AutocompleteInteractionErrorPayload} payload The contextual payload
     */
    AutocompleteInteractionError: 'autocompleteInteractionError' as const,
    // #endregion Autocomplete interaction

    // #region Slash command chain
    /**
     * Emitted when a slash command interaction is received.
     * @param {ChatInputCommandInteraction} interaction The interaction that was received.
     */
    PossibleSlashCommand: 'possibleSlashCommand' as const,
    /**
     * Emitted when the name of a sent slash command does not match any loaded commands.
     * @param {UnknownSlashCommandPayload} payload The contextual payload
     */
    UnknownSlashCommand: 'unknownSlashCommand' as const,
    /**
     * Emitted before the `slashRun` method of a command is run.
     * @param {PreSlashCommandRunPayload} payload The contextual payload
     */
    PreSlashCommandRun: 'preSlashCommandRun' as const,

    /**
     * Emitted when a precondition denies a slash command from being run.
     * @param {UserError} error The error reported by the precondition
     * @param {SlashCommandDeniedPayload} payload The contextual payload
     */
    SlashCommandDenied: 'slashCommandDenied' as const,
    /**
     * Emitted when a slash command passes all precondition checks, if any.
     * @param {SlashCommandAcceptedPayload} payload The contextual payload
     */
    SlashCommandAccepted: 'slashCommandAccepted' as const,

    /**
     * Emitted directly before a slash command is run.
     * @param {SlashCommandInteraction} interaction The interaction that executed the command
     * @param {SlashCommand} command The command that is being run
     * @param {SlashCommandRunPayload} payload The contextual payload
     */
    SlashCommandRun: 'slashCommandRun' as const,
    /**
     * Emitted after a slash command runs successfully.
     * @param {SlashCommandSuccessPayload} payload The contextual payload
     */
    SlashCommandSuccess: 'slashCommandSuccess' as const,
    /**
     * Emitted after a slash command runs unsuccessfully.
     * @param {*} error The error that was thrown
     * @param {SlashCommandErrorPayload} payload The contextual payload
     */
    SlashCommandError: 'slashCommandError' as const,
    /**
     * Emitted directly after a slash command finished running, regardless of the outcome.
     * @param {Interaction} interaction The interaction that executed the command
     * @param {SlashCommand} command The command that finished running
     * @param {SlashCommandFinishPayload} payload The contextual payload
     */
    SlashCommandFinish: 'slashCommandFinish' as const,
    // #endregion Slash command chain

    // #region Context menu chain
    /**
     * Emitted when a context menu interaction is recieved.
     * @param {ContextMenuCommandInteraction} interaction The interaction that was recieved.
     */
    PossibleContextMenuCommand: 'possibleContextMenuCommand' as const,
    /**
     * Emitted when the name of a sent context menu command does not match any loaded commands.
     * @param {UnknownContextMenuCommandPayload} payload The contextual payload
     */
    UnknownContextMenuCommand: 'unknownContextMenuCommand' as const,
    /**
     * Emitted before the `contextMenuRun` method of a command is run.
     * @param {PreContextMenuCommandRunPayload} payload The contextual payload
     */
    PreContextMenuCommandRun: 'preContextMenuCommandRun' as const,

    /**
     * Emitted when a precondition denies a context menu command from being run.
     * @param {UserError} error The error reported by the precondition
     * @param {ContextMenuCommandDeniedPayload} payload The contextual payload
     */
    ContextMenuCommandDenied: 'contextMenuCommandDenied' as const,
    /**
     * Emitted when a context menu command passes all precondition checks, if any.
     * @param {ContextMenuCommandAcceptedPayload} payload The contextual payload
     */
    ContextMenuCommandAccepted: 'contextMenuCommandAccepted' as const,

    /**
     * Emitted directly before a context menu command is run.
     * @param {ContextMenuCommandInteraction} interaction The interaction that executed the command
     * @param {ContextMenuCommand} command The command that is being run
     * @param {ContextMenuCommandRunPayload} payload The contextual payload
     */
    ContextMenuCommandRun: 'contextMenuCommandRun' as const,
    /**
     * Emitted after a context menu command runs successfully.
     * @param {ContextMenuCommandSuccessPayload} payload The contextual payload
     */
    ContextMenuCommandSuccess: 'contextMenuCommandSuccess' as const,
    /**
     * Emitted after a context menu command runs unsuccessfully.
     * @param {*} error The error that was thrown
     * @param {ContextMenuCommandErrorPayload} payload The contextual payload
     */
    ContextMenuCommandError: 'contextMenuCommandError' as const,
    /**
     * Emitted directly after a context menu command finished running, regardless of the outcome.
     * @param {Interaction} interaction The interaction that executed the command
     * @param {ContextMenuCommand} command The command that finished running
     * @param {ContextMenuCommandFinishPayload} payload The contextual payload
     */
    ContextMenuCommandFinish: 'contextMenuCommandFinish' as const,
    // #endregion Context menu chain

    // #region Button Component chain
    /**
     * Emitted when a button component interaction is received.
     * @param {ButtonInteractionInteraction} interaction The interaction that was received.
     */
    PossibleButtonInteraction: 'possibleButtonInteraction' as const,
    /**
     * Emitted when the name of a sent button component component does not match any loaded components.
     * @param {UnknownButtonInteractionPayload} payload The contextual payload
     */
    UnknownButtonInteraction: 'unknownButtonInteraction' as const,
    /**
     * Emitted before the `ButtonInteractionRun` method of a component is run.
     * @param {PreButtonInteractionRunPayload} payload The contextual payload
     */
    PreButtonInteractionRun: 'preButtonInteractionRun' as const,

    /**
     * Emitted when a precondition denies a button component component from being run.
     * @param {UserError} error The error reported by the precondition
     * @param {ButtonInteractionDeniedPayload} payload The contextual payload
     */
    ButtonInteractionDenied: 'ButtonInteractionDenied' as const,
    /**
     * Emitted when a button component component passes all precondition checks, if any.
     * @param {ButtonInteractionAcceptedPayload} payload The contextual payload
     */
    ButtonInteractionAccepted: 'ButtonInteractionAccepted' as const,

    /**
     * Emitted directly before a button component component is run.
     * @param {ButtonInteractionInteraction} interaction The interaction that executed the component
     * @param {PeridotButtonComponent} component The component that is being run
     * @param {ButtonInteractionRunPayload} payload The contextual payload
     */
    ButtonInteractionRun: 'ButtonInteractionRun' as const,
    /**
     * Emitted after a button component component runs successfully.
     * @param {ButtonInteractionSuccessPayload} payload The contextual payload
     */
    ButtonInteractionSuccess: 'ButtonInteractionSuccess' as const,
    /**
     * Emitted after a button component component runs unsuccessfully.
     * @param {*} error The error that was thrown
     * @param {ButtonInteractionErrorPayload} payload The contextual payload
     */
    ButtonInteractionError: 'ButtonInteractionError' as const,
    /**
     * Emitted directly after a button component component finished running, regardless of the outcome.
     * @param {Interaction} interaction The interaction that executed the component
     * @param {PeridotButtonComponent} component The component that finished running
     * @param {ButtonInteractionFinishPayload} payload The contextual payload
     */
    ButtonInteractionFinish: 'ButtonInteractionFinish' as const,
    // #endregion Button Component chain

    // #region Select Menu Component chain
    /**
     * Emitted when a select menu component interaction is received.
     * @param {SelectMenuInteractionInteraction} interaction The interaction that was received.
     */
    PossibleSelectMenuInteraction: 'possibleSelectMenuInteraction' as const,
    /**
     * Emitted when the name of a sent select menu component component does not match any loaded components.
     * @param {UnknownSelectMenuInteractionPayload} payload The contextual payload
     */
    UnknownSelectMenuInteraction: 'unknownSelectMenuInteraction' as const,
    /**
     * Emitted before the `SelectMenuInteractionRun` method of a component is run.
     * @param {PreSelectMenuInteractionRunPayload} payload The contextual payload
     */
    PreSelectMenuInteractionRun: 'preSelectMenuInteractionRun' as const,

    /**
     * Emitted when a precondition denies a select menu component component from being run.
     * @param {UserError} error The error reported by the precondition
     * @param {SelectMenuInteractionDeniedPayload} payload The contextual payload
     */
    SelectMenuInteractionDenied: 'SelectMenuInteractionDenied' as const,
    /**
     * Emitted when a select menu component component passes all precondition checks, if any.
     * @param {SelectMenuInteractionAcceptedPayload} payload The contextual payload
     */
    SelectMenuInteractionAccepted: 'SelectMenuInteractionAccepted' as const,

    /**
     * Emitted directly before a select menu component component is run.
     * @param {SelectMenuInteractionInteraction} interaction The interaction that executed the component
     * @param {SelectMenuComponent} component The component that is being run
     * @param {SelectMenuInteractionRunPayload} payload The contextual payload
     */
    SelectMenuInteractionRun: 'SelectMenuInteractionRun' as const,
    /**
     * Emitted after a select menu component component runs successfully.
     * @param {SelectMenuInteractionSuccessPayload} payload The contextual payload
     */
    SelectMenuInteractionSuccess: 'SelectMenuInteractionSuccess' as const,
    /**
     * Emitted after a select menu component component runs unsuccesfully.
     * @param {*} error The error that was thrown
     * @param {SelectMenuInteractionErrorPayload} payload The contextual payload
     */
    SelectMenuInteractionError: 'SelectMenuInteractionError' as const,
    /**
     * Emitted directly after a select menu component component finished running, regardless of the outcome.
     * @param {Interaction} interaction The interaction that executed the component
     * @param {SelectMenuComponent} component The component that finished running
     * @param {SelectMenuInteractionFinishPayload} payload The contextual payload
     */
    SelectMenuInteractionFinish: 'SelectMenuInteractionFinish' as const,
    // #endregion Select Menu Component chain

    // #region Modal Component chain
    /**
     * Emitted when a modal component interaction is received.
     * @param {ModalSubmitInteractionInteraction} interaction The interaction that was received.
     */
    PossibleModalSubmitInteraction: 'possibleModalSubmitInteraction' as const,
    /**
     * Emitted when the name of a sent modal component component does not match any loaded components.
     * @param {UnknownModalSubmitInteractionPayload} payload The contextual payload
     */
    UnknownModalSubmitInteraction: 'unknownModalSubmitInteraction' as const,
    /**
     * Emitted before the `ModalSubmitInteractionRun` method of a component is run.
     * @param {PreModalSubmitInteractionRunPayload} payload The contextual payload
     */
    PreModalSubmitInteractionRun: 'preModalSubmitInteractionRun' as const,

    /**
     * Emitted when a precondition denies a modal component component from being run.
     * @param {UserError} error The error reported by the precondition
     * @param {ModalSubmitInteractionDeniedPayload} payload The contextual payload
     */
    ModalSubmitInteractionDenied: 'ModalSubmitInteractionDenied' as const,
    /**
     * Emitted when a modal component component passes all precondition checks, if any.
     * @param {ModalSubmitInteractionAcceptedPayload} payload The contextual payload
     */
    ModalSubmitInteractionAccepted: 'ModalSubmitInteractionAccepted' as const,

    /**
     * Emitted directly before a modal component component is run.
     * @param {ModalSubmitInteractionInteraction} interaction The interaction that executed the component
     * @param {ModalComponent} component The component that is being run
     * @param {ModalSubmitInteractionRunPayload} payload The contextual payload
     */
    ModalSubmitInteractionRun: 'ModalSubmitInteractionRun' as const,
    /**
     * Emitted after a modal component component runs successfully.
     * @param {ModalSubmitInteractionSuccessPayload} payload The contextual payload
     */
    ModalSubmitInteractionSuccess: 'ModalSubmitInteractionSuccess' as const,
    /**
     * Emitted after a modal component component runs unsuccesfully.
     * @param {*} error The error that was thrown
     * @param {ModalSubmitInteractionErrorPayload} payload The contextual payload
     */
    ModalSubmitInteractionError: 'ModalSubmitInteractionError' as const,
    /**
     * Emitted directly after a modal component component finished running, regardless of the outcome.
     * @param {Interaction} interaction The interaction that executed the component
     * @param {ModalComponent} component The component that finished running
     * @param {ModalSubmitInteractionFinishPayload} payload The contextual payload
     */
    ModalSubmitInteractionFinish: 'ModalSubmitInteractionFinish' as const,
    // #endregion Modal Component chain

    // #endregion Custom events
} as const;

// #region Text command payloads
export interface UnknownTextCommandNamePayload {
    message: Message;
    prefix: string | RegExp;
    commandPrefix: string;
}

export interface UnknownTextCommandPayload extends UnknownTextCommandNamePayload {
    commandName: string;
}

export interface ITextCommandPayload {
    message: Message;
    command: TextCommand;
    logger: Logger;
}

export interface PreTextCommandRunPayload extends TextCommandDeniedPayload {}

export interface TextCommandDeniedPayload extends ITextCommandPayload {
    parameters: string;
}

export interface TextCommandAcceptedPayload extends ITextCommandPayload {
    parameters: string;
}

export interface TextCommandRunPayload extends TextCommandAcceptedPayload {
    args: unknown;
}

export interface TextCommandFinishPayload extends TextCommandRunPayload {
    success: boolean;
    duration: number;
}

export interface TextCommandErrorPayload extends TextCommandRunPayload {
    duration: number;
}

export interface TextCommandSuccessPayload extends TextCommandRunPayload {
    result: unknown;
    duration: number;
}

export interface TextCommandTypingErrorPayload extends TextCommandRunPayload {}
// #endregion Text command payloads

// #region Slash command payloads
export interface UnknownSlashCommandPayload {
    interaction: ChatInputCommandInteraction;
}

export interface ISlashCommandPayload {
    interaction: ChatInputCommandInteraction;
    command: SlashCommand;
    logger: Logger;
}

export interface PreSlashCommandRunPayload extends ISlashCommandPayload {}

export interface SlashCommandDeniedPayload extends ISlashCommandPayload {}

export interface SlashCommandAcceptedPayload extends PreSlashCommandRunPayload {}

export interface SlashCommandRunPayload extends SlashCommandAcceptedPayload {}

export interface SlashCommandFinishPayload extends SlashCommandAcceptedPayload {
    success: boolean;
    duration: number;
}

export interface SlashCommandSuccessPayload extends SlashCommandRunPayload {
    result: unknown;
    duration: number;
}

export interface SlashCommandErrorPayload extends ISlashCommandPayload {
    duration: number;
}

export interface AutocompleteInteractionPayload {
    interaction: AutocompleteInteraction;
    command: SlashCommand;
    logger: Logger;
}

export interface AutocompleteInteractionSuccessPayload extends AutocompleteInteractionPayload {
    result: unknown;
    duration: number;
}

export interface AutocompleteInteractionErrorPayload extends AutocompleteInteractionPayload {
    duration: number;
}
// #endregion Slash command payloads

// #region Context menu command payloads
export interface UnknownContextMenuCommandPayload {
    interaction: ContextMenuCommandInteraction;
}

export interface IContextMenuCommandPayload {
    interaction: ContextMenuCommandInteraction;
    command: ContextMenuCommand;
    logger: Logger;
}

export interface PreContextMenuCommandRunPayload extends IContextMenuCommandPayload {}

export interface ContextMenuCommandDeniedPayload extends IContextMenuCommandPayload {}

export interface ContextMenuCommandAcceptedPayload extends PreContextMenuCommandRunPayload {}

export interface ContextMenuCommandRunPayload extends ContextMenuCommandAcceptedPayload {}

export interface ContextMenuCommandFinishPayload extends ContextMenuCommandAcceptedPayload {
    success: boolean;
    duration: number;
}

export interface ContextMenuCommandSuccessPayload extends ContextMenuCommandRunPayload {
    result: unknown;
    duration: number;
}

export interface ContextMenuCommandErrorPayload extends IContextMenuCommandPayload {
    duration: number;
}
// #endregion Context menu command payloads

// #region Button component payloads
export interface UnknownButtonInteractionPayload {
    interaction: ButtonInteraction;
}

export interface IButtonInteractionPayload {
    interaction: ButtonInteraction;
    component: PeridotButtonComponent;
    logger: Logger;
}

export interface PreButtonInteractionRunPayload extends IButtonInteractionPayload {}

export interface ButtonInteractionDeniedPayload extends IButtonInteractionPayload {}

export interface ButtonInteractionAcceptedPayload extends PreButtonInteractionRunPayload {}

export interface ButtonInteractionRunPayload extends ButtonInteractionAcceptedPayload {}

export interface ButtonInteractionFinishPayload extends ButtonInteractionAcceptedPayload {
    success: boolean;
    duration: number;
}

export interface ButtonInteractionSuccessPayload extends ButtonInteractionRunPayload {
    result: unknown;
    duration: number;
}

export interface ButtonInteractionErrorPayload extends IButtonInteractionPayload {
    duration: number;
}
// #endregion Button component payloads

// #region Select menu component payloads
export interface UnknownSelectMenuInteractionPayload {
    interaction: AnySelectMenuInteraction;
}

export interface ISelectMenuInteractionPayload {
    interaction: AnySelectMenuInteraction;
    component: SelectMenuComponent<SelectMenuType>;
    logger: Logger;
}

export interface PreSelectMenuInteractionRunPayload extends ISelectMenuInteractionPayload {}

export interface SelectMenuInteractionDeniedPayload extends ISelectMenuInteractionPayload {}

export interface SelectMenuInteractionAcceptedPayload extends PreSelectMenuInteractionRunPayload {}

export interface SelectMenuInteractionRunPayload extends SelectMenuInteractionAcceptedPayload {}

export interface SelectMenuInteractionFinishPayload extends SelectMenuInteractionAcceptedPayload {
    success: boolean;
    duration: number;
}

export interface SelectMenuInteractionSuccessPayload extends SelectMenuInteractionRunPayload {
    result: unknown;
    duration: number;
}

export interface SelectMenuInteractionErrorPayload extends ISelectMenuInteractionPayload {
    duration: number;
}

// #endregion Select menu component payloads

// #region Modal component payloads
export interface UnknownModalSubmitInteractionPayload {
    interaction: ModalSubmitInteraction;
}

export interface IModalSubmitInteractionPayload {
    interaction: ModalSubmitInteraction;
    component: ModalComponent;
    logger: Logger;
}

export interface PreModalSubmitInteractionRunPayload extends IModalSubmitInteractionPayload {}

export interface ModalSubmitInteractionDeniedPayload extends IModalSubmitInteractionPayload {}

export interface ModalSubmitInteractionAcceptedPayload extends PreModalSubmitInteractionRunPayload {}

export interface ModalSubmitInteractionRunPayload extends ModalSubmitInteractionAcceptedPayload {}

export interface ModalSubmitInteractionFinishPayload extends ModalSubmitInteractionAcceptedPayload {
    success: boolean;
    duration: number;
}

export interface ModalSubmitInteractionSuccessPayload extends ModalSubmitInteractionRunPayload {
    result: unknown;
    duration: number;
}

export interface ModalSubmitInteractionErrorPayload extends IModalSubmitInteractionPayload {
    duration: number;
}
// #endregion Modal component payloads

declare const PeridotEvents: typeof Events;

declare module 'discord.js' {
    interface ClientEvents {
        [PeridotEvents.PreMessageParsed]: [message: Message];
        [PeridotEvents.MentionPrefixOnly]: [message: Message];
        [PeridotEvents.NonPrefixedMessage]: [message: Message];
        [PeridotEvents.PrefixedMessage]: [message: Message, prefix: string | RegExp];

        [PeridotEvents.UnknownTextCommandName]: [payload: UnknownTextCommandNamePayload];
        [PeridotEvents.UnknownTextCommand]: [payload: UnknownTextCommandPayload];
        [PeridotEvents.PreTextCommandRun]: [payload: PreTextCommandRunPayload];
        [PeridotEvents.TextCommandDenied]: [error: UserError, payload: TextCommandDeniedPayload];
        [PeridotEvents.TextCommandAccepted]: [payload: TextCommandAcceptedPayload];
        [PeridotEvents.TextCommandRun]: [message: Message, command: TextCommand, payload: TextCommandRunPayload];
        [PeridotEvents.TextCommandSuccess]: [payload: TextCommandSuccessPayload];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [PeridotEvents.TextCommandError]: [error: any, payload: TextCommandErrorPayload];
        [PeridotEvents.TextCommandFinish]: [message: Message, command: TextCommand, payload: TextCommandFinishPayload];

        [PeridotEvents.PossibleAutocompleteInteraction]: [interaction: AutocompleteInteraction];
        [PeridotEvents.AutocompleteInteractionError]: [error: unknown, payload: AutocompleteInteractionPayload];
        [PeridotEvents.AutocompleteInteractionSuccess]: [payload: AutocompleteInteractionPayload];

        // Slash command chain
        [PeridotEvents.PossibleSlashCommand]: [interaction: ChatInputCommandInteraction];
        [PeridotEvents.UnknownSlashCommand]: [payload: UnknownSlashCommandPayload];
        [PeridotEvents.PreSlashCommandRun]: [payload: PreSlashCommandRunPayload];

        [PeridotEvents.SlashCommandDenied]: [error: UserError, payload: SlashCommandDeniedPayload];
        [PeridotEvents.SlashCommandAccepted]: [payload: SlashCommandAcceptedPayload];

        [PeridotEvents.SlashCommandRun]: [interaction: ChatInputCommandInteraction, command: SlashCommand, payload: SlashCommandRunPayload];
        [PeridotEvents.SlashCommandSuccess]: [payload: SlashCommandSuccessPayload];
        [PeridotEvents.SlashCommandError]: [error: unknown, payload: SlashCommandErrorPayload];
        [PeridotEvents.SlashCommandFinish]: [interaction: ChatInputCommandInteraction, command: SlashCommand, payload: SlashCommandFinishPayload];

        // Context menu command chain
        [PeridotEvents.PossibleContextMenuCommand]: [interaction: ContextMenuCommandInteraction];
        [PeridotEvents.UnknownContextMenuCommand]: [payload: UnknownContextMenuCommandPayload];
        [PeridotEvents.PreContextMenuCommandRun]: [payload: PreContextMenuCommandRunPayload];

        [PeridotEvents.ContextMenuCommandDenied]: [error: UserError, payload: ContextMenuCommandDeniedPayload];
        [PeridotEvents.ContextMenuCommandAccepted]: [payload: ContextMenuCommandAcceptedPayload];

        [PeridotEvents.ContextMenuCommandRun]: [
            interaction: ContextMenuCommandInteraction,
            command: ContextMenuCommand,
            payload: ContextMenuCommandRunPayload,
        ];
        [PeridotEvents.ContextMenuCommandSuccess]: [payload: ContextMenuCommandSuccessPayload];
        [PeridotEvents.ContextMenuCommandError]: [error: unknown, payload: ContextMenuCommandErrorPayload];
        [PeridotEvents.ContextMenuCommandFinish]: [
            interaction: ContextMenuCommandInteraction,
            command: ContextMenuCommand,
            payload: ContextMenuCommandFinishPayload,
        ];

        // Button component chain
        [PeridotEvents.PossibleButtonInteraction]: [interaction: ButtonInteraction];
        [PeridotEvents.UnknownButtonInteraction]: [payload: UnknownButtonInteractionPayload];
        [PeridotEvents.PreButtonInteractionRun]: [payload: PreButtonInteractionRunPayload];

        [PeridotEvents.ButtonInteractionDenied]: [error: UserError, payload: ButtonInteractionDeniedPayload];
        [PeridotEvents.ButtonInteractionAccepted]: [payload: ButtonInteractionAcceptedPayload];

        [PeridotEvents.ButtonInteractionRun]: [
            interaction: ButtonInteraction,
            component: PeridotButtonComponent,
            payload: ButtonInteractionRunPayload,
        ];
        [PeridotEvents.ButtonInteractionSuccess]: [payload: ButtonInteractionSuccessPayload];
        [PeridotEvents.ButtonInteractionError]: [error: unknown, payload: ButtonInteractionErrorPayload];
        [PeridotEvents.ButtonInteractionFinish]: [
            interaction: ButtonInteraction,
            component: PeridotButtonComponent,
            payload: ButtonInteractionFinishPayload,
        ];

        // Select menu component chain
        [PeridotEvents.PossibleSelectMenuInteraction]: [interaction: AnySelectMenuInteraction];
        [PeridotEvents.UnknownSelectMenuInteraction]: [payload: UnknownSelectMenuInteractionPayload];
        [PeridotEvents.PreSelectMenuInteractionRun]: [payload: PreSelectMenuInteractionRunPayload];

        [PeridotEvents.SelectMenuInteractionDenied]: [error: UserError, payload: SelectMenuInteractionDeniedPayload];
        [PeridotEvents.SelectMenuInteractionAccepted]: [payload: SelectMenuInteractionAcceptedPayload];

        [PeridotEvents.SelectMenuInteractionRun]: [
            interaction: AnySelectMenuInteraction,
            component: SelectMenuComponent<SelectMenuType>,
            payload: SelectMenuInteractionRunPayload,
        ];
        [PeridotEvents.SelectMenuInteractionSuccess]: [payload: SelectMenuInteractionSuccessPayload];
        [PeridotEvents.SelectMenuInteractionError]: [error: unknown, payload: SelectMenuInteractionErrorPayload];
        [PeridotEvents.SelectMenuInteractionFinish]: [
            interaction: AnySelectMenuInteraction,
            component: SelectMenuComponent<SelectMenuType>,
            payload: SelectMenuInteractionFinishPayload,
        ];

        // Modal component chain
        [PeridotEvents.PossibleModalSubmitInteraction]: [interaction: ModalSubmitInteraction];
        [PeridotEvents.UnknownModalSubmitInteraction]: [payload: UnknownModalSubmitInteractionPayload];
        [PeridotEvents.PreModalSubmitInteractionRun]: [payload: PreModalSubmitInteractionRunPayload];

        [PeridotEvents.ModalSubmitInteractionDenied]: [error: UserError, payload: ModalSubmitInteractionDeniedPayload];
        [PeridotEvents.ModalSubmitInteractionAccepted]: [payload: ModalSubmitInteractionAcceptedPayload];

        [PeridotEvents.ModalSubmitInteractionRun]: [
            interaction: ModalSubmitInteraction,
            component: ModalComponent,
            payload: ModalSubmitInteractionRunPayload,
        ];
        [PeridotEvents.ModalSubmitInteractionSuccess]: [payload: ModalSubmitInteractionSuccessPayload];
        [PeridotEvents.ModalSubmitInteractionError]: [error: unknown, payload: ModalSubmitInteractionErrorPayload];
        [PeridotEvents.ModalSubmitInteractionFinish]: [
            interaction: ModalSubmitInteraction,
            component: ModalComponent,
            payload: ModalSubmitInteractionFinishPayload,
        ];
    }
}

export const registerEvents = () => {
    const { client } = container;
    client.once(Events.ClientReady, () => {
        container.logger.info('Client ready');
    });

    // #region Text command events
    client.on(Events.MessageCreate, onMessageCreate);
    client.on(Events.PrefixedMessage, onPrefixedMessage);
    client.on(Events.PreTextCommandRun, preTextCommandRun);
    client.on(Events.TextCommandAccepted, onTextCommandAccepted);

    client.on(Events.TextCommandDenied, (error, { logger }) => {
        logger.debug({ err: error }, 'TextCommandDenied');
    });
    client.on(Events.TextCommandSuccess, ({ duration, logger }) => {
        logger.debug({ duration }, 'TextCommandSuccess');
    });
    client.on(Events.TextCommandError, (error, { message, parameters, duration, logger }) => {
        if (error instanceof UserError) {
            message
                .reply({
                    embeds: [new EmbedBuilder().setTitle('An error occurred').setDescription(error.message).setColor(Colors.Red)],
                })
                .catch((err) => {
                    logger.error({ err, message: error.message }, 'Failed to send error message');
                });
        }

        if (error instanceof Error) {
            error = {
                message: error.message,
                name: error.name,
            };
        }

        logger.error({ err: error, parameters, duration }, 'TextCommandError');
    });
    client.on(Events.UnknownTextCommandName, ({ message, commandPrefix, prefix }) => {
        container.logger.trace({ src: message.id, commandPrefix, prefix }, 'UnknownTextCommandName');
    });
    client.on(Events.UnknownTextCommand, ({ message, commandName }) => {
        container.logger.trace({ src: message.id, command: commandName }, 'UnknownTextCommand');
    });
    client.on(Events.NonPrefixedMessage, (message) => {
        container.logger.trace({ src: message.id }, 'NonPrefixedMessage');
    });
    client.on(Events.MentionPrefixOnly, (message) => {
        container.logger.trace({ src: message.id }, 'MentionPrefixOnly');
    });
    // #endregion Text command events

    client.on(Events.InteractionCreate, onInteractionCreate);
    // #region Slash command events
    client.on(Events.PossibleSlashCommand, onPossibleSlashCommand);
    client.on(Events.PreSlashCommandRun, onPreSlashCommandRun);
    client.on(Events.SlashCommandAccepted, onSlashCommandAccepted);

    client.on(Events.SlashCommandDenied, (error, { logger }) => {
        logger.debug({ err: error }, 'SlashCommandDenied');
    });
    client.on(Events.SlashCommandSuccess, ({ duration, logger }) => {
        logger.debug({ duration }, 'SlashCommandSuccess');
    });
    client.on(Events.SlashCommandError, (error, { interaction, duration, logger }) => {
        if (error instanceof UserError) {
            try {
                const embed = new EmbedBuilder().setTitle('Error').setDescription(error.message).setColor(Colors.Red);
                if (interaction.replied) {
                    void interaction.followUp({ embeds: [embed], ephemeral: interaction.ephemeral ?? false });
                } else {
                    void interaction.reply({ embeds: [embed], ephemeral: interaction.ephemeral ?? false });
                }

                logger.error({ err: error }, 'UserError');

                return;
            } catch (err) {
                logger.error({ err }, 'Failed to handle user error');
            }
        }

        if (error instanceof Error) {
            error = {
                message: error.message,
                name: error.name,
            };
        }

        logger.error({ err: error, duration }, 'Unknown Error');
    });
    client.on(Events.UnknownSlashCommand, ({ interaction }) => {
        container.logger.trace({ src: interaction.id }, 'UnknownSlashCommand');
    });
    // #endregion Slash command events

    // #region Context menu command events
    client.on(Events.PossibleContextMenuCommand, onPossibleContextMenuCommand);
    client.on(Events.PreContextMenuCommandRun, onPreContextMenuCommandRun);
    client.on(Events.ContextMenuCommandAccepted, onContextMenuCommandAccepted);

    client.on(Events.ContextMenuCommandDenied, (error, { logger }) => {
        logger.debug({ err: error }, 'ContextMenuCommandDenied');
    });
    client.on(Events.ContextMenuCommandSuccess, ({ duration, logger }) => {
        logger.debug({ duration }, 'ContextMenuCommandSuccess');
    });
    client.on(Events.ContextMenuCommandError, (error, { interaction, duration, logger }) => {
        if (error instanceof UserError) {
            try {
                const embed = new EmbedBuilder().setTitle('Error').setDescription(error.message).setColor(Colors.Red);
                if (interaction.replied) {
                    void interaction.followUp({ embeds: [embed], ephemeral: interaction.ephemeral ?? false });
                } else {
                    void interaction.reply({ embeds: [embed], ephemeral: interaction.ephemeral ?? false });
                }

                logger.error({ err: error }, 'UserError');

                return;
            } catch (err) {
                logger.error({ err }, 'Failed to handle user error');
            }
        }

        if (error instanceof Error) {
            error = {
                message: error.message,
                name: error.name,
            };
        }

        logger.error({ err: error, duration }, 'Unknown Error');
    });
    client.on(Events.UnknownContextMenuCommand, ({ interaction }) => {
        container.logger.trace({ src: interaction.id }, 'UnknownContextMenuCommand');
    });
    // #endregion Context menu command events

    // #region Button component events
    client.on(Events.PossibleButtonInteraction, onPossibleButtonInteraction);
    client.on(Events.PreButtonInteractionRun, onPreButtonInteractionRun);
    client.on(Events.ButtonInteractionAccepted, onButtonInteractionAccepted);

    client.on(Events.ButtonInteractionDenied, (error, { logger }) => {
        logger.debug({ err: error }, 'ButtonInteractionDenied');
    });
    client.on(Events.ButtonInteractionSuccess, ({ duration, logger }) => {
        logger.debug({ duration }, 'ButtonInteractionSuccess');
    });
    client.on(Events.ButtonInteractionError, (error, { interaction, duration, logger }) => {
        if (error instanceof UserError) {
            try {
                const embed = new EmbedBuilder().setTitle('Error').setDescription(error.message).setColor(Colors.Red);
                if (interaction.replied) {
                    void interaction.followUp({ embeds: [embed], ephemeral: interaction.ephemeral ?? false });
                } else {
                    void interaction.reply({ embeds: [embed], ephemeral: interaction.ephemeral ?? false });
                }

                logger.error({ err: error }, 'UserError');

                return;
            } catch (err) {
                logger.error({ err }, 'Failed to handle user error');
            }
        }

        if (error instanceof Error) {
            error = {
                message: error.message,
                name: error.name,
            };
        }

        logger.error({ err: error, duration }, 'Unknown Error');
    });
    client.on(Events.UnknownButtonInteraction, ({ interaction }) => {
        container.logger.trace({ src: interaction.id }, 'UnknownButtonInteraction');
    });
    // #endregion Button component events

    // #region Select menu component events
    client.on(Events.PossibleSelectMenuInteraction, onPossibleSelectMenuInteraction);
    client.on(Events.PreSelectMenuInteractionRun, onPreSelectMenuInteractionRun);
    client.on(Events.SelectMenuInteractionAccepted, onSelectMenuInteractionAccepted);

    client.on(Events.SelectMenuInteractionDenied, (error, { logger }) => {
        logger.debug({ err: error }, 'SelectMenuInteractionDenied');
    });
    client.on(Events.SelectMenuInteractionSuccess, ({ duration, logger }) => {
        logger.debug({ duration }, 'SelectMenuInteractionSuccess');
    });
    client.on(Events.SelectMenuInteractionError, (error, { interaction, duration, logger }) => {
        if (error instanceof UserError) {
            try {
                const embed = new EmbedBuilder().setTitle('Error').setDescription(error.message).setColor(Colors.Red);
                if (interaction.replied) {
                    void interaction.followUp({ embeds: [embed], ephemeral: interaction.ephemeral ?? false });
                } else {
                    void interaction.reply({ embeds: [embed], ephemeral: interaction.ephemeral ?? false });
                }

                logger.error({ err: error }, 'UserError');

                return;
            } catch (err) {
                logger.error({ err }, 'Failed to handle user error');
            }
        }

        if (error instanceof Error) {
            error = {
                message: error.message,
                name: error.name,
            };
        }

        logger.error({ err: error, duration }, 'Unknown Error');
    });
    client.on(Events.UnknownSelectMenuInteraction, ({ interaction }) => {
        container.logger.trace({ src: interaction.id }, 'UnknownSelectMenuInteraction');
    });
    // #endregion Select menu component events

    // #region Modal component events
    client.on(Events.PossibleModalSubmitInteraction, onPossibleModalSubmitInteraction);
    client.on(Events.PreModalSubmitInteractionRun, onPreModalSubmitInteractionRun);
    client.on(Events.ModalSubmitInteractionAccepted, onModalSubmitInteractionAccepted);

    client.on(Events.ModalSubmitInteractionDenied, (error, { logger }) => {
        logger.debug({ err: error }, 'ModalSubmitInteractionDenied');
    });
    client.on(Events.ModalSubmitInteractionSuccess, ({ duration, logger }) => {
        logger.debug({ duration }, 'ModalSubmitInteractionSuccess');
    });
    client.on(Events.ModalSubmitInteractionError, (error, { interaction, duration, logger }) => {
        if (error instanceof UserError) {
            try {
                const embed = new EmbedBuilder().setTitle('Error').setDescription(error.message).setColor(Colors.Red);
                if (interaction.replied) {
                    void interaction.followUp({ embeds: [embed], ephemeral: interaction.ephemeral ?? false });
                } else {
                    void interaction.reply({ embeds: [embed], ephemeral: interaction.ephemeral ?? false });
                }

                logger.error({ err: error }, 'UserError');

                return;
            } catch (err) {
                logger.error({ err }, 'Failed to handle user error');
            }
        }

        if (error instanceof Error) {
            error = {
                message: error.message,
                name: error.name,
            };
        }

        logger.error({ err: error, duration }, 'Unknown Error');
    });
    client.on(Events.UnknownModalSubmitInteraction, ({ interaction }) => {
        container.logger.trace({ src: interaction.id }, 'UnknownModalSubmitInteraction');
    });
    // #endregion Modal component events
};
