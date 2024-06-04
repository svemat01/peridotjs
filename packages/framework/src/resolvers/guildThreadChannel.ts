import { isThreadChannel } from '@sapphire/discord.js-utilities';
import type { Result } from '@sapphire/result';
import type { Guild, ThreadChannel } from 'discord.js';

import { Identifiers } from '../errors/Identifiers.js';
import { resolveGuildChannelPredicate } from './resolveGuildChannelPredicate.js';

export function resolveGuildThreadChannel(
    parameter: string,
    guild: Guild,
): Result<ThreadChannel, Identifiers.ArgumentGuildChannelError | Identifiers.ArgumentGuildThreadChannelError> {
    return resolveGuildChannelPredicate(parameter, guild, isThreadChannel, Identifiers.ArgumentGuildThreadChannelError);
}
