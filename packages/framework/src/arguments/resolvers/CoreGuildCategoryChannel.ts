import type { CategoryChannel } from 'discord.js';

import { Identifiers } from '../../errors/Identifiers.js';
import { resolveGuildCategoryChannel } from '../../resolvers/guildCategoryChannel.js';
import { Argument } from '../Argument.js';
import type { ArgumentContext, ArgumentResult } from '../types.js';

export class CoreGuildCategoryChannel extends Argument<CategoryChannel> {
    public constructor() {
        super({ name: 'guildCategoryChannel' });
    }

    public run(parameter: string, context: ArgumentContext): ArgumentResult<CategoryChannel> {
        const { guild } = context.message;
        if (!guild) {
            return this.error({
                parameter,
                identifier: Identifiers.ArgumentGuildChannelMissingGuildError,
                message: 'This command can only be used in a server.',
                context,
            });
        }

        const resolved = resolveGuildCategoryChannel(parameter, guild);
        return resolved.mapErrInto((identifier) =>
            this.error({
                parameter,
                identifier,
                message: 'The argument did not resolve to a valid server category channel.',
                context: { ...context, guild },
            }),
        );
    }
}
