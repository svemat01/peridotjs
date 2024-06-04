import { Identifiers } from '../../errors/Identifiers.js';
import { resolveString } from '../../resolvers/string.js';
import { Argument } from '../Argument.js';
import type { ArgumentContext, ArgumentResult } from '../types.js';

export class CoreString extends Argument<string> {
    private readonly messages = {
        [Identifiers.ArgumentStringTooShort]: ({ minimum }: ArgumentContext) => `The argument must be longer than ${minimum} characters.`,
        [Identifiers.ArgumentStringTooLong]: ({ maximum }: ArgumentContext) => `The argument must be shorter than ${maximum} characters.`,
    } as const;

    public constructor() {
        super({ name: 'string' });
    }

    public run(parameter: string, context: ArgumentContext): ArgumentResult<string> {
        const resolved = resolveString(parameter, {
            minimum: context?.minimum,
            maximum: context?.maximum,
        });
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
