import type { DMChannel } from 'discord.js';

import { resolveDMChannel } from '../../resolvers/dmChannel.js';
import { Argument } from '../Argument.js';

export class CoreDMChannel extends Argument<DMChannel> {
    public constructor() {
        super({ name: 'dmChannel' });
    }

    public run(parameter: string, context: Argument.Context): Argument.Result<DMChannel> {
        const resolved = resolveDMChannel(parameter, context.message);
        return resolved.mapErrInto((identifier) =>
            this.error({
                parameter,
                identifier,
                message: 'The argument did not resolve to a DM channel.',
                context,
            }),
        );
    }
}
