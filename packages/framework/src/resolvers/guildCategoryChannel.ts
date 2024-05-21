import { isCategoryChannel } from '@sapphire/discord.js-utilities';
import type { Result } from '@sapphire/result';
import type { CategoryChannel, Guild } from 'discord.js';

import { Identifiers } from '../errors/Identifiers.js';
import { resolveGuildChannelPredicate } from '../structures/resolvers/resolveGuildChannelPredicate.js';

export function resolveGuildCategoryChannel(
    parameter: string,
    guild: Guild,
): Result<CategoryChannel, Identifiers.ArgumentGuildChannelError | Identifiers.ArgumentGuildCategoryChannelError> {
    return resolveGuildChannelPredicate(parameter, guild, isCategoryChannel, Identifiers.ArgumentGuildCategoryChannelError);
}
