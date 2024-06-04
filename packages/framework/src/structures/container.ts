import type { Client, ClientEvents, SelectMenuType } from 'discord.js';
import type { i18n } from 'i18next';
import type { Logger } from 'pino';

import type { SelectMenuComponent } from '../handlers/SelectMenuComponent.js';
import type { TextCommand } from '../handlers/TextCommand.js';
import type { ButtonComponent, ClientEvent, ContextMenuCommand, ModalComponent, SlashCommand } from '../index.js';
import type { PermissionLevelConfig } from './permissions.js';
class HandlerContainer {
    public textCommands: Map<string, TextCommand> = new Map();
    public slashCommands: Map<string, SlashCommand> = new Map();
    public contextMenuCommands: Map<string, ContextMenuCommand> = new Map();
    public buttons: ButtonComponent[] = [];
    public modals: ModalComponent[] = [];
    public selectMenus: SelectMenuComponent<SelectMenuType>[] = [];
    public clientEvents: Map<string, Set<ClientEvent<keyof ClientEvents>>> = new Map();
}
class Container {
    public handlers = new HandlerContainer();
    public _i18n: i18n | undefined = undefined;

    public permissionConfig: PermissionLevelConfig = {
        global: {},
        guilds: {},
    };

    private _logger: Logger | null = null;
    private _client: Client | null = null;

    private constructor() {}

    public init(client: Client, logger: Logger, i18n?: i18n) {
        this._client = client;
        this._logger = logger;
        this._i18n = i18n;
    }

    private static instance: Container;

    public static getInstance() {
        if (!Container.instance) {
            Container.instance = new Container();
        }
        return Container.instance;
    }

    public get logger(): Logger {
        if (!this._logger) {
            throw new Error('Logger not set');
        }

        return this._logger;
    }

    public get client(): Client {
        if (!this._client) {
            throw new Error('Client not set');
        }

        return this._client;
    }

    public get i18n(): i18n {
        if (!this._i18n) {
            throw new Error('i18n not set');
        }

        return this._i18n;
    }
}

export const container = Container.getInstance();
