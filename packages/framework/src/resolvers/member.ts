import { SnowflakeRegex, UserOrMemberMentionRegex } from '@sapphire/discord.js-utilities';
import { Result } from '@sapphire/result';
import { isNullish } from '@sapphire/utilities';
import type { Guild, GuildMember, Snowflake } from 'discord.js';

import { Identifiers } from '../errors/Identifiers.js';

export async function resolveMember(
    parameter: string,
    guild: Guild,
    performFuzzySearch?: boolean,
): Promise<Result<GuildMember, Identifiers.ArgumentMemberError>> {
    let member = await resolveById(parameter, guild);

    if (isNullish(member) && performFuzzySearch) {
        member = await resolveByQuery(parameter, guild);
    }

    if (member) {
        return Result.ok(member);
    }

    return Result.err(Identifiers.ArgumentMemberError);
}

async function resolveById(argument: string, guild: Guild): Promise<GuildMember | null> {
    const memberId = UserOrMemberMentionRegex.exec(argument) ?? SnowflakeRegex.exec(argument);
    return memberId ? guild.members.fetch(memberId[1] as Snowflake).catch(() => null) : null;
}

async function resolveByQuery(argument: string, guild: Guild): Promise<GuildMember | null> {
    argument = argument.length > 5 && argument.at(-5) === '#' ? argument.slice(0, -5) : argument;

    const members = await guild.members.fetch({ query: argument, limit: 1 }).catch(() => null);
    return members?.first() ?? null;
}
