/**
 * Entry point for the structures module of the PeridotJS framework.
 * This module exports all the core structural components needed to build a Discord bot.
 * 
 * The structures module provides:
 * - Client implementation and configuration
 * - Global container for framework components
 * - Handler loading and management
 * - Permission system
 * - Plugin system
 * 
 * @module structures
 * @since 0.2.6
 */

export * from './client.js';
export * from './container.js';
export * from './loaders.js';
export * from './permissions.js';
export * from './plugins.js';
