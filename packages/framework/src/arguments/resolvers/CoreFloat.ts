import { Identifiers } from '../../errors/Identifiers.js';
import { resolveFloat } from '../../resolvers/float.js';
import { Argument } from '../Argument.js';

export class CoreFloat extends Argument<number> {
    private readonly messages = {
        [Identifiers.ArgumentFloatTooSmall]: ({ minimum }: Argument.Context) => `The given number must be greater than ${minimum}.`,
        [Identifiers.ArgumentFloatTooLarge]: ({ maximum }: Argument.Context) => `The given number must be less than ${maximum}.`,
        [Identifiers.ArgumentFloatError]: () => 'The argument did not resolve to a valid decimal.',
    } as const;

    public constructor() {
        super({ name: 'float' });
    }

    public run(parameter: string, context: Argument.Context): Argument.Result<number> {
        const resolved = resolveFloat(parameter, { minimum: context.minimum, maximum: context.maximum });
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
