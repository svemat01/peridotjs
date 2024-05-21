import { SnowflakeRegex } from '@sapphire/discord-utilities';
import { Result } from '@sapphire/result';
import type { Guild } from 'discord.js';

import { Identifiers } from '../errors/Identifiers.js';
import { container } from '../structures/container.js';

export async function resolveGuild(parameter: string): Promise<Result<Guild, Identifiers.ArgumentGuildError>> {
    const guildId = SnowflakeRegex.exec(parameter)?.groups?.id;
    const guild = guildId ? await container.client.guilds.fetch(guildId).catch(() => null) : null;

    if (guild) {
        return Result.ok(guild);
    }

    return Result.err(Identifiers.ArgumentGuildError);
}
