import type { Logger } from 'pino';

/**
 * Represents the result of a command execution.
 * @since 0.2.6
 * @category Commands
 */
export type CommandResult =
    | {
          /** Indicates the command executed successfully */
          success: true;
      }
    | {
          /** Indicates the command failed */
          success: false;
          /** Error message explaining why the command failed */
          message: string;
      };

/**
 * Common context properties shared across all command and interaction handlers.
 * @since 0.2.6
 * @category Context
 */
export interface CommonContext {
    /**
     * The logger instance for this context.
     * Used for logging debug information, errors, and other important events.
     */
    logger: Logger;
    // /**
    //  * The i18n instance for this interaction.
    //  * @throws If accessed without i18n being set on the client.
    //  */
    // i18n: i18n;
}

/**
 * Extends the i18next type definitions with custom default variables.
 * @since 0.2.6
 * @category Internationalization
 */
declare module 'i18next' {
    interface CustomDefaultVariables {
        /** The username of the command author */
        authorUsername: string;
        /** The mention string for the command author */
        authorMention: string;
    }
}

export * from './ButtonComponent.js';
export * from './ClientEvent.js';
export * from './ContextMenuCommand.js';
export * from './ModalComponent.js';
export * from './SelectMenuComponent.js';
export * from './SlashCommand.js';
export * from './TextCommand.js';
