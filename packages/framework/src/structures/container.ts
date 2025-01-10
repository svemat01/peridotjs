/**
 * Provides the global container system for the PeridotJS framework.
 * The container is a central registry that provides access to core framework components.
 * It's inspired by SapphireJS's container system but implemented with a more functional approach.
 * 
 * The container is used to:
 * - Access the Discord.js client instance
 * - Manage handlers through the HandlerRegistryManager
 * - Configure permission levels
 * - Access the logger instance
 * 
 * @module structures/container
 * @since 0.2.6
 * @example
 * ```typescript
 * import { container } from '@peridot/framework';
 * 
 * // Access the client instance
 * const client = container.client;
 * 
 * // Access the handler registry manager
 * const handlers = container.handlers;
 * 
 * // Access the logger
 * const logger = container.logger;
 * ```
 */

import type { Client } from 'discord.js';
import type { Logger } from 'pino';

import type { HandlerRegistryManager } from '../index.js';
import type { PermissionLevelConfig } from './permissions.js';

/**
 * Interface defining the structure of the global container.
 * This interface can be augmented by plugins to add their own properties.
 * 
 * @since 0.2.6
 * @category Interfaces
 * @see {@link container}
 */
export interface Container {
    /** The Discord.js client instance */
    client: Client;
    /** The handler registry manager for managing all types of handlers */
    handlers: HandlerRegistryManager;
    /** The permission configuration for the bot */
    permissionConfig: PermissionLevelConfig;
    /** The logger instance */
    logger: Logger;
}

/**
 * The global container instance.
 * This object is populated during client initialization and provides access to core framework components.
 * 
 * @since 0.2.6
 * @category Variables
 * @example
 * ```typescript
 * import { container } from '@peridot/framework';
 * 
 * // Use the container to access framework components
 * container.logger.info('Hello from PeridotJS!');
 * ```
 */
export const container: Container = {} as Container;
