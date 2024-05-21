import type { SelectMenuComponent } from '../components/SelectMenuComponent.js';
import type { ButtonComponent, ContextMenuCommand, ModalComponent, SlashCommand, TextCommand } from '../index.js';

export type CmdExport = {
    text?: TextCommand[];
    slash?: SlashCommand[];
    contextMenu?: ContextMenuCommand[];
    buttons?: ButtonComponent[];
    modals?: ModalComponent[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectMenus?: SelectMenuComponent<any>[];
    __brand: 'CmdExport';
};

export const createCmdExport = (cmdExport: Omit<CmdExport, '__brand'>) => {
    return {
        ...cmdExport,
        __brand: 'CmdExport' as const,
    };
};

export const isCmdExport = (cmdExport: unknown): cmdExport is CmdExport =>
    typeof cmdExport === 'object' && cmdExport !== null && (cmdExport as CmdExport)?.__brand === 'CmdExport';
