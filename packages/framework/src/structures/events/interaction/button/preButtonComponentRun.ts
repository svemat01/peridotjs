
import  { Result } from '@sapphire/result';

import  { UserError } from '../../../../errors/UserError.js';
import { Events, type PreButtonInteractionRunPayload } from '../../events.js';

export async function onPreButtonInteractionRun(payload: PreButtonInteractionRunPayload) {
    const { interaction, logger } = payload;

    logger.trace('PreButtonInteractionRun');

    // Run global preconditions:
    const globalResult = await globalPreconditions(payload);
    if (globalResult.isErr()) {
        interaction.client.emit(Events.ButtonInteractionDenied, globalResult.unwrapErr(), payload);
        return;
    }

    // // Run command-specific preconditions:
    // const localResult = await command.preconditions.messageRun(message, command, payload as any);
    // if (localResult.isErr()) {
    //     message.client.emit(Events.TextCommandDenied, localResult.unwrapErr(), payload);
    //     return;
    // }

    interaction.client.emit(Events.ButtonInteractionAccepted, payload);
}

async function globalPreconditions(_payload: PreButtonInteractionRunPayload): Promise<Result<unknown, UserError>> {
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