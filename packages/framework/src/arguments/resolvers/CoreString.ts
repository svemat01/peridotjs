import { Identifiers } from '../../errors/Identifiers.js';
import { resolveString } from '../../resolvers/string.js';
import { Argument } from '../Argument.js';

export class CoreString extends Argument<string> {
    private readonly messages = {
        [Identifiers.ArgumentStringTooShort]: ({ minimum }: Argument.Context) => `The argument must be longer than ${minimum} characters.`,
        [Identifiers.ArgumentStringTooLong]: ({ maximum }: Argument.Context) => `The argument must be shorter than ${maximum} characters.`,
    } as const;

    public constructor() {
        super({ name: 'string' });
    }

    public run(parameter: string, context: Argument.Context): Argument.Result<string> {
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
