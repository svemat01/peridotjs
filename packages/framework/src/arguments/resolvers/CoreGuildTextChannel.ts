import type { TextChannel } from 'discord.js';

import { Identifiers } from '../../errors/Identifiers.js';
import { resolveGuildTextChannel } from '../../resolvers/guildTextChannel.js';
import { Argument } from '../Argument.js';

export class CoreGuildTextChannel extends Argument<TextChannel> {
    public constructor() {
        super({ name: 'guildTextChannel' });
    }

    public run(parameter: string, context: Argument.Context): Argument.Result<TextChannel> {
        const { guild } = context.message;
        if (!guild) {
            return this.error({
                parameter,
                identifier: Identifiers.ArgumentGuildChannelMissingGuildError,
                message: 'This command can only be used in a server.',
                context,
            });
        }

        const resolved = resolveGuildTextChannel(parameter, guild);
        return resolved.mapErrInto((identifier) =>
            this.error({
                parameter,
                identifier,
                message: 'The given argument did not resolve to a valid text channel.',
                context: { ...context, guild },
            }),
        );
    }
}
