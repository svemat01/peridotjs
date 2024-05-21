import type { Message } from 'discord.js';

import { resolveMessage } from '../../resolvers/index.js';
import { Argument } from '../Argument.js';
import type { MessageArgumentContext } from '../Contexts.js';

export class CoreMessage extends Argument<Message> {
    public constructor() {
        super({ name: 'message' });
    }

    public async run(parameter: string, context: MessageArgumentContext): Argument.AsyncResult<Message> {
        const channel = context.channel ?? context.message.channel;
        const resolved = await resolveMessage(parameter, {
            messageOrInteraction: context.message,
            channel: context.channel,
            scan: context.scan ?? false,
        });

        return resolved.mapErrInto((identifier) =>
            this.error({
                parameter,
                identifier,
                message: 'The given argument did not resolve to a message.',
                context: { ...context, channel },
            }),
        );
    }
}
