import type { DMChannel, PartialDMChannel } from 'discord.js';

import { resolvePartialDMChannel } from '../../resolvers/partialDMChannel.js';
import { Argument } from '../Argument.js';
import type { ArgumentContext, ArgumentResult } from '../types.js';

export class CorePartialDMChannel extends Argument<DMChannel | PartialDMChannel> {
    public constructor() {
        super({ name: 'partialDMChannel' });
    }

    public run(parameter: string, context: ArgumentContext): ArgumentResult<DMChannel | PartialDMChannel> {
        const resolved = resolvePartialDMChannel(parameter, context.message);
        return resolved.mapErrInto((identifier) =>
            this.error({
                parameter,
                identifier,
                message: 'The argument did not resolve to a Partial DM channel.',
                context,
            }),
        );
    }
}
