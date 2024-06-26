import { isTextChannel } from '@sapphire/discord.js-utilities';
import type { Result } from '@sapphire/result';
import type { Guild, TextChannel } from 'discord.js';

import { Identifiers } from '../errors/Identifiers.js';
import { resolveGuildChannelPredicate } from './resolveGuildChannelPredicate.js';

export function resolveGuildTextChannel(
    parameter: string,
    guild: Guild,
): Result<TextChannel, Identifiers.ArgumentGuildChannelError | Identifiers.ArgumentGuildTextChannelError> {
    return resolveGuildChannelPredicate(parameter, guild, isTextChannel, Identifiers.ArgumentGuildTextChannelError);
}
