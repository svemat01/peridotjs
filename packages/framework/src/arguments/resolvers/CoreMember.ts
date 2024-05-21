import type { GuildMember } from 'discord.js';

import { Identifiers } from '../../errors/Identifiers.js';
import { resolveMember } from '../../resolvers/member.js';
import { Argument } from '../Argument.js';
import type { MemberArgumentContext } from '../Contexts.js';

export class CoreMember extends Argument<GuildMember> {
    public constructor() {
        super({ name: 'member' });
    }

    public async run(parameter: string, context: MemberArgumentContext): Argument.AsyncResult<GuildMember> {
        const { guild } = context.message;

        if (!guild) {
            return this.error({
                parameter,
                identifier: Identifiers.ArgumentMemberMissingGuild,
                message: 'This command can only be used in a server.',
                context,
            });
        }

        const resolved = await resolveMember(parameter, guild, context.performFuzzySearch ?? true);
        return resolved.mapErrInto((identifier) =>
            this.error({
                parameter,
                identifier,
                message: 'The given argument did not resolve to a server member.',
                context: { ...context, guild },
            }),
        );
    }
}
