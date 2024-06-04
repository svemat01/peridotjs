import type { NewsChannel } from 'discord.js';

import { Identifiers } from '../../errors/Identifiers.js';
import { resolveGuildNewsChannel } from '../../resolvers/guildNewsChannel.js';
import { Argument } from '../Argument.js';
import type { ArgumentContext, ArgumentResult } from '../types.js';

export class CoreGuildNewsChannel extends Argument<NewsChannel> {
    public constructor() {
        super({ name: 'guildNewsChannel' });
    }

    public run(parameter: string, context: ArgumentContext): ArgumentResult<NewsChannel> {
        const { guild } = context.message;
        if (!guild) {
            return this.error({
                parameter,
                identifier: Identifiers.ArgumentGuildChannelMissingGuildError,
                message: 'This command can only be used in a server.',
                context,
            });
        }

        const resolved = resolveGuildNewsChannel(parameter, guild);
        return resolved.mapErrInto((identifier) =>
            this.error({
                parameter,
                identifier,
                message: 'The given argument did not resolve to a valid announcements channel.',
                context: { ...context, guild },
            }),
        );
    }
}
