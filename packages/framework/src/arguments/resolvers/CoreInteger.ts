import { Identifiers } from '../../errors/Identifiers.js';
import { resolveInteger } from '../../resolvers/integer.js';
import { Argument } from '../Argument.js';
import type { ArgumentContext, ArgumentResult } from '../types.js';

export class CoreInteger extends Argument<number> {
    private readonly messages = {
        [Identifiers.ArgumentIntegerTooSmall]: ({ minimum }: ArgumentContext) => `The given number must be greater than ${minimum}.`,
        [Identifiers.ArgumentIntegerTooLarge]: ({ maximum }: ArgumentContext) => `The given number must be less than ${maximum}.`,
        [Identifiers.ArgumentIntegerError]: () => 'The argument did not resolve to a valid number.',
    } as const;

    public constructor() {
        super({ name: 'integer' });
    }

    public run(parameter: string, context: ArgumentContext): ArgumentResult<number> {
        const resolved = resolveInteger(parameter, { minimum: context.minimum, maximum: context.maximum });
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
