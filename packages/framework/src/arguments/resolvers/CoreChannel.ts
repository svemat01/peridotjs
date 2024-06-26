import type { ChannelTypes } from '@sapphire/discord.js-utilities';

import { resolveChannel } from '../../resolvers/channel.js';
import { Argument } from '../Argument.js';
import type { ArgumentContext, ArgumentResult } from '../types.js';

export class CoreChannel extends Argument<ChannelTypes> {
    public constructor() {
        super({ name: 'channel' });
    }

    public run(parameter: string, context: ArgumentContext): ArgumentResult<ChannelTypes> {
        const resolved = resolveChannel(parameter, context.message);
        return resolved.mapErrInto((identifier) =>
            this.error({
                parameter,
                identifier,
                message: 'The argument did not resolve to a channel.',
                context,
            }),
        );
    }
}
