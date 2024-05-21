import { isVoiceChannel } from '@sapphire/discord.js-utilities';
import type { Result } from '@sapphire/result';
import type { Guild, VoiceChannel } from 'discord.js';

import { Identifiers } from '../errors/Identifiers.js';
import { resolveGuildChannelPredicate } from '../structures/resolvers/resolveGuildChannelPredicate.js';

export function resolveGuildVoiceChannel(
    parameter: string,
    guild: Guild,
): Result<VoiceChannel, Identifiers.ArgumentGuildChannelError | Identifiers.ArgumentGuildVoiceChannelError> {
    return resolveGuildChannelPredicate(parameter, guild, isVoiceChannel, Identifiers.ArgumentGuildVoiceChannelError);
}
