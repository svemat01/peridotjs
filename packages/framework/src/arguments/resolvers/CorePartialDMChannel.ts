import type { DMChannel, PartialDMChannel } from 'discord.js';

import { resolvePartialDMChannel } from '../../resolvers/partialDMChannel.js';
import { Argument } from '../Argument.js';

export class CorePartialDMChannel extends Argument<DMChannel | PartialDMChannel> {
    public constructor() {
        super({ name: 'partialDMChannel' });
    }

    public run(parameter: string, context: Argument.Context): Argument.Result<DMChannel | PartialDMChannel> {
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
