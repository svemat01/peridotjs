import { isNewsChannel } from '@sapphire/discord.js-utilities';
import type { Result } from '@sapphire/result';
import type { Guild, NewsChannel } from 'discord.js';

import { Identifiers } from '../errors/Identifiers.js';
import { resolveGuildChannelPredicate } from './resolveGuildChannelPredicate.js';

export function resolveGuildNewsChannel(
    parameter: string,
    guild: Guild,
): Result<NewsChannel, Identifiers.ArgumentGuildChannelError | Identifiers.ArgumentGuildNewsChannelError> {
    return resolveGuildChannelPredicate(parameter, guild, isNewsChannel, Identifiers.ArgumentGuildNewsChannelError);
}
