
import  { Result } from '@sapphire/result';

import  { UserError } from '../../../errors/UserError.js';
import { Events, type PreSelectMenuInteractionRunPayload } from '../../index.js';

export async function onPreSelectMenuInteractionRun(payload: PreSelectMenuInteractionRunPayload) {
    const { interaction, logger } = payload;

    logger.trace('PreSelectMenuInteractionRun');

    // Run global preconditions:
    const globalResult = await globalPreconditions(payload);
    if (globalResult.isErr()) {
        interaction.client.emit(Events.SelectMenuInteractionDenied, globalResult.unwrapErr(), payload);
        return;
    }

    // // Run command-specific preconditions:
    // const localResult = await command.preconditions.messageRun(message, command, payload as any);
    // if (localResult.isErr()) {
    //     message.client.emit(Events.TextCommandDenied, localResult.unwrapErr(), payload);
    //     return;
    // }

    interaction.client.emit(Events.SelectMenuInteractionAccepted, payload);
}

async function globalPreconditions(_payload: PreSelectMenuInteractionRunPayload): Promise<Result<unknown, UserError>> {
    // const { interaction, component } = payload;

    // if (Array.isArray(command.guilds)) {
    //     if (!command.guilds.includes(interaction.guildId ?? '')) {
    //         return Result.err(
    //             new UserError({
    //                 identifier: 'Preconditions.GuildOnly',
    //                 message: 'This command can only be used in specific servers.',
    //             }),
    //         );
    //     }
    // }

    return Result.ok(undefined);
}