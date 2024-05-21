import { ChannelMentionRegex, type ChannelTypes } from '@sapphire/discord.js-utilities';
import { Result } from '@sapphire/result';
import type { CommandInteraction, Message, Snowflake } from 'discord.js';

import { Identifiers } from '../errors/Identifiers.js';
import { container } from '../structures/container.js';

export function resolveChannel(
    parameter: string,
    messageOrInteraction: Message | CommandInteraction,
): Result<ChannelTypes, Identifiers.ArgumentChannelError> {
    const channelId = (ChannelMentionRegex.exec(parameter)?.[1] ?? parameter) as Snowflake;
    const channel = (messageOrInteraction.guild ? messageOrInteraction.guild.channels : container.client.channels).cache.get(channelId);

    if (channel) {
        return Result.ok(channel as ChannelTypes);
    }

    return Result.err(Identifiers.ArgumentChannelError);
}
