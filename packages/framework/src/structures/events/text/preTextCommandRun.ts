import { Result } from '@sapphire/result';

import { UserError } from '../../../errors/UserError.js';
import { container } from '../../container.js';
import { getPermissionLevel, PermissionLevel } from '../../permissions.js';
import type { PreTextCommandRunPayload } from '../events.js';
import { Events } from '../events.js';

export async function preTextCommandRun(payload: PreTextCommandRunPayload) {
    const { message, logger } = payload;

    logger.trace('PreTextCommandRun');

    // Run global preconditions:
    const globalResult = await globalPreconditions(payload);
    if (globalResult.isErr()) {
        message.client.emit(Events.TextCommandDenied, globalResult.unwrapErr(), payload);
        return;
    }

    // // Run command-specific preconditions:
    // const localResult = await command.preconditions.messageRun(message, command, payload as any);
    // if (localResult.isErr()) {
    //     message.client.emit(Events.TextCommandDenied, localResult.unwrapErr(), payload);
    //     return;
    // }

    message.client.emit(Events.TextCommandAccepted, payload);
}

async function globalPreconditions(payload: PreTextCommandRunPayload): Promise<Result<unknown, UserError>> {
    const { message, command } = payload;

    if (!message.guild && !command.data.dm) {
        return Result.err(
            new UserError({
                identifier: 'Preconditions.GuildOnly',
                message: 'This command can only be used in a server.',
            }),
        );
    }

    const member = await message.member?.fetch();
    const memberPermissionLevel = getPermissionLevel(member ?? null, container.permissionConfig);

    if (memberPermissionLevel < command.data.permission) {
        return Result.err(
            new UserError({
                identifier: 'Preconditions.PermissionLevel',
                message: `You need to be at least level ${PermissionLevel[command.data.permission]} to use this command.`,
            }),
        );
    }

    if (Array.isArray(command.data.guilds)) {
        if (!command.data.guilds.includes(message.guildId ?? '') && memberPermissionLevel < PermissionLevel.ADMINISTRATOR) {
            return Result.err(
                new UserError({
                    identifier: 'Preconditions.GuildOnly',
                    message: 'This command can only be used in specific servers.',
                }),
            );
        }
    }

    return Result.ok(undefined);
}
