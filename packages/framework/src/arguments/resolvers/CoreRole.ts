import type { Role } from 'discord.js';

import { Identifiers } from '../../errors/Identifiers.js';
import { resolveRole } from '../../resolvers/role.js';
import { Argument } from '../Argument.js';
import type { ArgumentContext, AsyncArgumentResult } from '../types.js';

export class CoreRole extends Argument<Role> {
    public constructor() {
        super({ name: 'role' });
    }

    public async run(parameter: string, context: ArgumentContext): AsyncArgumentResult<Role> {
        const { guild } = context.message;
        if (!guild) {
            return this.error({
                parameter,
                identifier: Identifiers.ArgumentRoleMissingGuild,
                message: 'This command can only be used in a server.',
                context,
            });
        }

        const resolved = await resolveRole(parameter, guild);
        return resolved.mapErrInto((identifier) =>
            this.error({
                parameter,
                identifier,
                message: 'The given argument did not resolve to a role.',
                context: { ...context, guild },
            }),
        );
    }
}
