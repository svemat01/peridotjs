import type { URL } from 'node:url';

import { resolveHyperlink } from '../../resolvers/hyperlink.js';
import { Argument } from '../Argument.js';
import type { ArgumentContext, ArgumentResult } from '../types.js';

export class CoreHyperlink extends Argument<URL> {
    public constructor() {
        super({ name: 'hyperlink' });
    }

    public run(parameter: string, context: ArgumentContext): ArgumentResult<URL> {
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
