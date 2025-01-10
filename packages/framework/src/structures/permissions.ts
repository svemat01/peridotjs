/**
 * Provides the permission system for the PeridotJS framework.
 * This module implements a hierarchical permission system that can be used to control
 * access to commands and features both globally and per-guild.
 * 
 * The permission system provides:
 * - Hierarchical permission levels (OWNER, ADMINISTRATOR, MODERATOR, REGULAR, BLOCKED)
 * - Global and per-guild permission configuration
 * - Permission level checking and comparison
 * 
 * @module structures/permissions
 * @since 0.2.6
 */

import type { GuildMember, Snowflake } from 'discord.js';

/**
 * Enumeration of available permission levels.
 * Permission levels are hierarchical, with higher levels having more access.
 * 
 * @since 0.2.6
 * @category Enums
 * @example
 * ```typescript
 * // Check if a user has moderator permissions
 * if (userLevel >= PermissionLevel.MODERATOR) {
 *   // User can access moderator features
 * }
 * ```
 */
export enum PermissionLevel {
    /** Blocked users cannot use any commands */
    BLOCKED = -1,
    /** Regular users have access to basic commands */
    REGULAR = 0,
    /** Moderators have access to moderation commands */
    MODERATOR = 1,
    /** Administrators have access to administrative commands */
    ADMINISTRATOR = 2,
    /** Owners have access to all commands */
    OWNER = 3,
}

/**
 * Type representing a mapping of user IDs to permission levels.
 * Used to configure permissions for specific users.
 * 
 * @since 0.2.6
 * @category Types
 */
export type PermissionLevelMapping = Record<Snowflake, PermissionLevel>;

/**
 * Interface for configuring permission levels globally and per-guild.
 * 
 * @since 0.2.6
 * @category Interfaces
 * @example
 * ```typescript
 * const config: PermissionLevelConfig = {
 *   global: {
 *     'OWNER_ID': PermissionLevel.OWNER,
 *     'ADMIN_ID': PermissionLevel.ADMINISTRATOR
 *   },
 *   guilds: {
 *     'GUILD_ID': {
 *       'MOD_ID': PermissionLevel.MODERATOR
 *     }
 *   }
 * };
 * ```
 */
export type PermissionLevelConfig = {
    /** Global permission level mappings */
    global: PermissionLevelMapping;
    /** Per-guild role permission level mappings */
    guilds?: Record<Snowflake, PermissionLevelMapping>;
}

/**
 * Retrieves the permission level for a given member based on the provided configuration.
 * @param member - The guild member for whom to retrieve the permission level.
 * @param config - The configuration object containing global and guild-specific permission levels.
 * @returns The permission level of the member.
 */
export const getPermissionLevel = (member: GuildMember | null, config: PermissionLevelConfig): PermissionLevel => {
    if (!member) return PermissionLevel.REGULAR; // Return Regular perm if no member

    const defaultRole = PermissionLevel.REGULAR;

    if (config.global[member.id]) {
        return config.global[member.id]!;
    }

    const guildConfig = config.guilds?.[member.guild.id];

    if (!guildConfig) return defaultRole;

    return _getPermissionLevel(Array.from(member.roles.cache.keys()), defaultRole, guildConfig);
};

const greaterThan = (a: number, b: number) => (a > b ? a : b);

/**
 * Returns the permission level based on the given role IDs, default role, and ID-to-Role map.
 * @param rolesIds - An array of role IDs.
 * @param defaultRole - The default permission level.
 * @param IDRoleMap - A map of role IDs to permission levels.
 * @returns The calculated permission level.
 */
export const _getPermissionLevel = (
    rolesIds: string[],
    defaultRole: PermissionLevel,
    IDRoleMap: Record<string, PermissionLevel>,
): PermissionLevel => {
    return rolesIds.reduce<PermissionLevel>(
        (previousLevel, roleId) =>
            greaterThan(previousLevel, IDRoleMap[Object.keys(IDRoleMap).find((roleIds) => roleIds.includes(roleId)) || ''] || defaultRole),
        defaultRole,
    );
};