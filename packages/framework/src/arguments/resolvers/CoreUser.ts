import type { User } from 'discord.js';

import { resolveUser } from '../../resolvers/user.js';
import { Argument } from '../Argument.js';
import type { ArgumentContext, AsyncArgumentResult } from '../types.js';

export class CoreUser extends Argument<User> {
    public constructor() {
        super({ name: 'user' });
    }

    public async run(parameter: string, context: ArgumentContext): AsyncArgumentResult<User> {
        const resolved = await resolveUser(parameter);
        return resolved.mapErrInto((identifier) =>
            this.error({
                parameter,
                identifier,
                message: 'The given argument did not resolve to a Discord user.',
                context,
            }),
        );
    }
}
