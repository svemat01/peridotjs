import type { Guild } from 'discord.js';

import { resolveGuild } from '../../resolvers/guild.js';
import { Argument } from '../Argument.js';
import type { ArgumentContext, AsyncArgumentResult } from '../types.js';

export class CoreGuild extends Argument<Guild> {
    public constructor() {
        super({ name: 'guild' });
    }

    public async run(parameter: string, context: ArgumentContext): AsyncArgumentResult<Guild> {
        const resolved = await resolveGuild(parameter);
        return resolved.mapErrInto((identifier) =>
            this.error({
                parameter,
                identifier,
                message: 'The given argument did not resolve to a Discord guild.',
                context,
            }),
        );
    }
}
