import type { DMChannel } from 'discord.js';

import { resolveDMChannel } from '../../resolvers/dmChannel.js';
import { Argument } from '../Argument.js';
import type { ArgumentContext, ArgumentResult } from '../types.js';

export class CoreDMChannel extends Argument<DMChannel> {
    public constructor() {
        super({ name: 'dmChannel' });
    }

    public run(parameter: string, context: ArgumentContext): ArgumentResult<DMChannel> {
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
