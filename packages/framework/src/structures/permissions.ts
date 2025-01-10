import type { GuildMember, Snowflake } from 'discord.js';

/**
 * Represents the permission levels for a user.
 */
export enum PermissionLevel {
    /**
     * The owner permission level.
     */
    OWNER = 4,

    /**
     * The administrator permission level.
     */
    ADMINISTRATOR = 3,

    /**
     * The moderator permission level.
     */
    MODERATOR = 2,

    /**
     * The regular user permission level.
     */
    REGULAR = 1,

    /**
     * The blocked user permission level.
     */
    BLOCKED = 0,
}

/**
 * Represents the configuration for permission levels.
 *
 * @example
 * ```typescript
 * {
 *   global: {
 *     'USER_ID_1': PermissionLevel.ADMINISTRATOR, // Has administrator permissions globally
 *   },
 *   guilds: {
 *     'GUILD_ID_1': {
 *         'USER_ID_2': PermissionLevel.ADMINISTRATOR, // Has administrator permissions in GUILD_ID_1
 *     },
 *  },
 * ```
 */
export type PermissionLevelConfig = {
    /**
     * The global permission level for each user.
     *
     * User ID -> Permission Level
     */
    global: Record<Snowflake, PermissionLevel>;

    /**
     * The permission level map for each guild.
     *
     * Guild ID -> Role ID -> Permission Level
     */
    guilds: Record<Snowflake, Record<Snowflake, PermissionLevel>>;
};

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

    const guildConfig = config.guilds[member.guild.id];

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
