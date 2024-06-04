import { resolveEnum } from '../../resolvers/enum.js';
import { Argument } from '../Argument.js';
import type { EnumArgumentContext } from '../Contexts.js';
import type { ArgumentResult } from '../types.js';

export class CoreEnum extends Argument<string> {
    public constructor() {
        super({ name: 'enum' });
    }

    public run(parameter: string, context: EnumArgumentContext): ArgumentResult<string> {
        const resolved = resolveEnum(parameter, { enum: context.enum, caseInsensitive: context.caseInsensitive });
        return resolved.mapErrInto((identifier) =>
            this.error({
                parameter,
                identifier,
                message: `The argument must have one of the following values: ${context.enum?.join(', ')}`,
                context,
            }),
        );
    }
}
