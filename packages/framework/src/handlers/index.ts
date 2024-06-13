import type { i18n } from 'i18next';
import type { Logger } from 'pino';

export type CommandResult =
    | {
          success: true;
      }
    | {
          success: false;
          message: string;
      };

export type CommonContext = {
    logger: Logger;
    /**
     * The i18n instance for this interaction.
     * @throws If accessed without i18n being set on the client.
     */
    i18n: i18n;
};

declare module 'i18next' {
    interface CustomDefaultVariables {
        authorUsername: string;
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
