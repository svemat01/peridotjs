import type { Client } from 'discord.js';
import type { Logger } from 'pino';

import type { HandlerRegistryManager } from '../index.js';
import type { PermissionLevelConfig } from './permissions.js';

export interface Container {
    client: Client;
    handlers: HandlerRegistryManager;
    permissionConfig: PermissionLevelConfig;
    logger: Logger;
}

export const container: Container = {} as Container;
