import { Identifiers } from '../../errors/Identifiers.js';
import { resolveNumber } from '../../resolvers/number.js';
import { Argument } from '../Argument.js';
import type { ArgumentContext, ArgumentResult } from '../types.js';

export class CoreNumber extends Argument<number> {
    private readonly messages = {
        [Identifiers.ArgumentNumberTooSmall]: ({ minimum }: ArgumentContext) => `The given number must be greater than ${minimum}.`,
        [Identifiers.ArgumentNumberTooLarge]: ({ maximum }: ArgumentContext) => `The given number must be less than ${maximum}.`,
        [Identifiers.ArgumentNumberError]: () => 'The argument did not resolve to a valid number.',
    } as const;

    public constructor() {
        super({ name: 'number' });
    }

    public run(parameter: string, context: ArgumentContext): ArgumentResult<number> {
        const resolved = resolveNumber(parameter, { minimum: context.minimum, maximum: context.maximum });
        return resolved.mapErrInto((identifier) =>
            this.error({
                parameter,
                identifier,
                message: this.messages[identifier](context),
                context,
            }),
        );
    }
}
