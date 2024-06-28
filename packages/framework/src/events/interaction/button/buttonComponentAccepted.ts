import { Result } from '@sapphire/result';
import { Stopwatch } from '@sapphire/stopwatch';

import { type ButtonInteractionAcceptedPayload, Events } from '../../index.js';

export async function onButtonInteractionAccepted(payload: ButtonInteractionAcceptedPayload) {
    const { interaction, component, logger } = payload;

    logger.trace('ButtonInteractionAccepted');

    const result = await Result.fromAsync(async () => {
        interaction.client.emit(Events.ButtonInteractionRun, interaction, component, payload);

        const stopwatch = new Stopwatch();
        const result = await component.run(interaction, {
            logger,
        });
        const { duration } = stopwatch.stop();

        interaction.client.emit(Events.ButtonInteractionSuccess, {
            ...payload,
            result,
            duration,
        });

        return duration;
    });

    result.inspectErr((error) =>
        interaction.client.emit(Events.ButtonInteractionError, error, {
            ...payload,
            duration: -1,
        }),
    );

    interaction.client.emit(Events.ButtonInteractionFinish, interaction, component, {
        ...payload,
        success: result.isOk(),
        duration: result.unwrapOr(-1),
    });
}
