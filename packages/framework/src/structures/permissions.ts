import type { GuildMember, Snowflake } from 'discord.js';

export enum PermissionLevel {
    OWNER = 4,
    ADMINISTRATOR = 3,
    MODERATOR = 2,
    REGULAR = 1,
    BLOCKED = 0,
}

export type PermissionLevelConfig = {
    /**
     * The global permission level for each user
     *
     * User ID -> Permission Level
     */
    global: Record<Snowflake, PermissionLevel>;
    /**
     * The permission level map for each guild
     *
     * Guild ID -> Role ID -> Permission Level
     */
    guilds: Record<Snowflake, Record<Snowflake, PermissionLevel>>;
};

export const getPermissionLevel = (
    member: GuildMember | null,
    config: {
        global: Record<string, PermissionLevel>;
        guilds: Record<string, Record<string, PermissionLevel>>;
    },
): PermissionLevel => {
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
