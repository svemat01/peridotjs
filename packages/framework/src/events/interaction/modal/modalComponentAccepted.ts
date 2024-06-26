import { Result } from '@sapphire/result';
import { Stopwatch } from '@sapphire/stopwatch';

import { Events, type ModalSubmitInteractionAcceptedPayload } from '../../index.js';

export async function onModalSubmitInteractionAccepted(payload: ModalSubmitInteractionAcceptedPayload) {
    const { interaction, component, logger } = payload;

    logger.trace('ModalSubmitInteractionAccepted');

    const result = await Result.fromAsync(async () => {
        interaction.client.emit(Events.ModalSubmitInteractionRun, interaction, component, payload);

        const stopwatch = new Stopwatch();
        const result = await component.run(interaction, {
            logger,
        });
        const { duration } = stopwatch.stop();

        interaction.client.emit(Events.ModalSubmitInteractionSuccess, {
            ...payload,
            result,
            duration,
        });

        return duration;
    });

    result.inspectErr((error) =>
        interaction.client.emit(Events.ModalSubmitInteractionError, error, {
            ...payload,
            duration: -1,
        }),
    );

    interaction.client.emit(Events.ModalSubmitInteractionFinish, interaction, component, {
        ...payload,
        success: result.isOk(),
        duration: result.unwrapOr(-1),
    });
}
