import { isDMChannel } from '@sapphire/discord.js-utilities';
import { Result } from '@sapphire/result';
import type { CommandInteraction, DMChannel, Message } from 'discord.js';

import { Identifiers } from '../errors/Identifiers.js';
import { resolveChannel } from './channel.js';

export function resolveDMChannel(
    parameter: string,
    messageOrInteraction: Message | CommandInteraction,
): Result<DMChannel, Identifiers.ArgumentChannelError | Identifiers.ArgumentDMChannelError> {
    const result = resolveChannel(parameter, messageOrInteraction);
    return result.mapInto((value) => {
        if (isDMChannel(value) && !value.partial) {
            return Result.ok(value);
        }

        return Result.err<Identifiers.ArgumentDMChannelError>(Identifiers.ArgumentDMChannelError);
    });
}
