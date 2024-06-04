import type { EmojiObject } from '../../resolvers/emoji.js';
import { resolveEmoji } from '../../resolvers/emoji.js';
import { Argument } from '../Argument.js';
import type { ArgumentContext, ArgumentResult } from '../types.js';

export class CoreEmoji extends Argument<EmojiObject> {
    public constructor() {
        super({ name: 'emoji' });
    }

    public run(parameter: string, context: ArgumentContext): ArgumentResult<EmojiObject> {
        const resolved = resolveEmoji(parameter);
        return resolved.mapErrInto((identifier) =>
            this.error({
                parameter,
                identifier,
                message: 'The argument did not resolve to an emoji.',
                context,
            }),
        );
    }
}
