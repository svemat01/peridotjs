import type { ThreadChannel } from 'discord.js';

import { Identifiers } from '../../errors/Identifiers.js';
import { resolveGuildPrivateThreadChannel } from '../../resolvers/guildPrivateThreadChannel.js';
import { Argument } from '../Argument.js';

export class CoreGuildPrivateThreadChannel extends Argument<ThreadChannel> {
    public constructor() {
        super({ name: 'guildPrivateThreadChannel' });
    }

    public run(parameter: string, context: Argument.Context): Argument.Result<ThreadChannel> {
        const { guild } = context.message;
        if (!guild) {
            return this.error({
                parameter,
                identifier: Identifiers.ArgumentGuildChannelMissingGuildError,
                message: 'This command can only be used in a server.',
                context,
            });
        }

        const resolved = resolveGuildPrivateThreadChannel(parameter, guild);
        return resolved.mapErrInto((identifier) =>
            this.error({
                parameter,
                identifier,
                message: 'The given argument did not resolve to a valid private thread.',
                context: { ...context, guild },
            }),
        );
    }
}
