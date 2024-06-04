import type { GuildBasedChannelTypes } from '@sapphire/discord.js-utilities';

import { Identifiers } from '../../errors/Identifiers.js';
import { resolveGuildChannel } from '../../resolvers/guildChannel.js';
import { Argument } from '../Argument.js';
import type { ArgumentContext, ArgumentResult } from '../types.js';

export class CoreGuildChannel extends Argument<GuildBasedChannelTypes> {
    public constructor() {
        super({ name: 'guildChannel' });
    }

    public run(parameter: string, context: ArgumentContext): ArgumentResult<GuildBasedChannelTypes> {
        const { guild } = context.message;
        if (!guild) {
            return this.error({
                parameter,
                identifier: Identifiers.ArgumentGuildChannelMissingGuildError,
                message: 'This command can only be used in a server.',
                context,
            });
        }

        const resolved = resolveGuildChannel(parameter, guild);
        return resolved.mapErrInto((identifier) =>
            this.error({
                parameter,
                identifier,
                message: 'The argument did not resolve to a valid server channel.',
                context: { ...context, guild },
            }),
        );
    }
}
