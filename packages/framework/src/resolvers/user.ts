import { SnowflakeRegex, UserOrMemberMentionRegex } from '@sapphire/discord.js-utilities';
import { Result } from '@sapphire/result';
import type { Snowflake, User } from 'discord.js';

import { Identifiers } from '../errors/Identifiers.js';
import { container } from '../structures/container.js';

export async function resolveUser(parameter: string): Promise<Result<User, Identifiers.ArgumentUserError>> {
    const userId = UserOrMemberMentionRegex.exec(parameter) ?? SnowflakeRegex.exec(parameter);
    let user = userId ? await container.client.users.fetch(userId[1] as Snowflake).catch(() => undefined) : undefined;

    if (!user) {
        user = container.client.users.cache.find((u) => u.username === parameter);
    }

    if (user) {
        return Result.ok(user);
    }

    return Result.err(Identifiers.ArgumentUserError);
}
