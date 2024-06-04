import { resolveBoolean } from '../../resolvers/boolean.js';
import { Argument } from '../Argument.js';
import type { BooleanArgumentContext } from '../Contexts.js';
import type { ArgumentResult } from '../types.js';

export class CoreBoolean extends Argument<boolean> {
    public constructor() {
        super({ name: 'boolean' });
    }

    public run(parameter: string, context: BooleanArgumentContext): ArgumentResult<boolean> {
        const resolved = resolveBoolean(parameter, { truths: context.truths, falses: context.falses });
        return resolved.mapErrInto((identifier) =>
            this.error({
                parameter,
                identifier,
                message: 'The argument did not resolve to a boolean.',
                context,
            }),
        );
    }
}
