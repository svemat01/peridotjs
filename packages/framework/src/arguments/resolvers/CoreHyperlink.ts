import type { URL } from 'node:url';

import { resolveHyperlink } from '../../resolvers/hyperlink.js';
import { Argument } from '../Argument.js';

export class CoreHyperlink extends Argument<URL> {
    public constructor() {
        super({ name: 'hyperlink' });
    }

    public run(parameter: string, context: Argument.Context): Argument.Result<URL> {
        const resolved = resolveHyperlink(parameter);
        return resolved.mapErrInto((identifier) =>
            this.error({
                parameter,
                identifier,
                message: 'The argument did not resolve to a valid URL.',
                context,
            }),
        );
    }
}
