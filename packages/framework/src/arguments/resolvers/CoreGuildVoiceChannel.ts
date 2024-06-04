import type { VoiceChannel } from 'discord.js';

import { Identifiers } from '../../errors/Identifiers.js';
import { resolveGuildVoiceChannel } from '../../resolvers/guildVoiceChannel.js';
import { Argument } from '../Argument.js';
import type { ArgumentContext, ArgumentResult } from '../types.js';

export class CoreGuildVoiceChannel extends Argument<VoiceChannel> {
    public constructor() {
        super({ name: 'guildVoiceChannel' });
    }

    public run(parameter: string, context: ArgumentContext): ArgumentResult<VoiceChannel> {
        const { guild } = context.message;
        if (!guild) {
            return this.error({
                parameter,
                identifier: Identifiers.ArgumentGuildChannelMissingGuildError,
                message: 'This command can only be used in a server.',
                context,
            });
        }

        const resolved = resolveGuildVoiceChannel(parameter, guild);
        return resolved.mapErrInto((identifier) =>
            this.error({
                parameter,
                identifier,
                message: 'The given argument did not resolve to a valid voice channel.',
                context: { ...context, guild },
            }),
        );
    }
}
