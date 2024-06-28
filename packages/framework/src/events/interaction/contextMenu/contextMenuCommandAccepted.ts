import { Result } from '@sapphire/result';
import { Stopwatch } from '@sapphire/stopwatch';

import { type ContextMenuCommandAcceptedPayload,Events } from '../../index.js';


export async function onContextMenuCommandAccepted(payload: ContextMenuCommandAcceptedPayload) {
    const { interaction, command, logger } = payload;

    logger.trace('ContextMenuCommandAccepted');

    const result = await Result.fromAsync(async () => {
        interaction.client.emit(Events.ContextMenuCommandRun, interaction, command,  payload);
        if (command.type !== interaction.commandType) {
            throw new Error(`Expected command type ${command.type}, got ${interaction.commandType}`);
        }

        const stopwatch = new Stopwatch();

        // @ts-expect-error Typescript breaks since user and message context menus have different types
        const result = await command.run(interaction, {
            logger,
        });
        const { duration } = stopwatch.stop();

        interaction.client.emit(Events.ContextMenuCommandSuccess, {
            ...payload,
            result,
            duration,
        });

        return duration;
    });

    result.inspectErr((error) =>
        interaction.client.emit(Events.ContextMenuCommandError, error, {
            ...payload,
            duration: -1,
        }),
    );

    interaction.client.emit(Events.ContextMenuCommandFinish, interaction, command, {
        ...payload,
        success: result.isOk(),
        duration: result.unwrapOr(-1),
    });
}
