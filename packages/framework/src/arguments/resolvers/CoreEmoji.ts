import type { EmojiObject } from '../../resolvers/emoji.js';
import { resolveEmoji } from '../../resolvers/emoji.js';
import { Argument } from '../Argument.js';

export class CoreEmoji extends Argument<EmojiObject> {
    public constructor() {
        super({ name: 'emoji' });
    }

    public run(parameter: string, context: Argument.Context): Argument.Result<EmojiObject> {
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
