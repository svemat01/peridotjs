import { isNewsThreadChannel } from '@sapphire/discord.js-utilities';
import type { Result } from '@sapphire/result';
import type { Guild, ThreadChannel } from 'discord.js';

import { Identifiers } from '../errors/Identifiers.js';
import { resolveGuildChannelPredicate } from './resolveGuildChannelPredicate.js';

export function resolveGuildNewsThreadChannel(
    parameter: string,
    guild: Guild,
): Result<
    ThreadChannel,
    Identifiers.ArgumentGuildChannelError | Identifiers.ArgumentGuildThreadChannelError | Identifiers.ArgumentGuildNewsThreadChannelError
> {
    return resolveGuildChannelPredicate(parameter, guild, isNewsThreadChannel, Identifiers.ArgumentGuildNewsThreadChannelError);
}
