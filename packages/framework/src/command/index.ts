export * from './cmdExports.js';
export * from './context.js';
export * from './ContextMenuCommand.js';
export * from './SlashCommand.js';
export * from './TextCommand.js';

export type CommandResult =
    | {
          success: true;
      }
    | {
          success: false;
          message: string;
      };
