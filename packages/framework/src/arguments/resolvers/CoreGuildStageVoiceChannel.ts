import type { StageChannel } from 'discord.js';

import { Identifiers } from '../../errors/Identifiers.js';
import { resolveGuildStageVoiceChannel } from '../../resolvers/guildStageVoiceChannel.js';
import { Argument } from '../Argument.js';
import type { ArgumentContext, ArgumentResult } from '../types.js';

export class CoreGuildStageVoiceChannel extends Argument<StageChannel> {
    public constructor() {
        super({ name: 'guildStageVoiceChannel' });
    }

    public run(parameter: string, context: ArgumentContext): ArgumentResult<StageChannel> {
        const { guild } = context.message;
        if (!guild) {
            return this.error({
                parameter,
                identifier: Identifiers.ArgumentGuildChannelMissingGuildError,
                message: 'This command can only be used in a server.',
                context,
            });
        }

        const resolved = resolveGuildStageVoiceChannel(parameter, guild);
        return resolved.mapErrInto((identifier) =>
            this.error({
                parameter,
                identifier,
                message: 'The given argument did not resolve to a valid stage voice channel.',
                context: { ...context, guild },
            }),
        );
    }
}
