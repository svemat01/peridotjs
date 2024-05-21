import { Result } from '@sapphire/result';
import { Stopwatch } from '@sapphire/stopwatch';
import { userMention } from 'discord.js';

import { container } from '../../../container.js';
import { type ButtonInteractionAcceptedPayload,Events } from '../../events.js';


export async function onButtonInteractionAccepted(payload: ButtonInteractionAcceptedPayload) {
    const { interaction, component, logger } = payload;

    logger.trace('ButtonInteractionAccepted');

    const result = await Result.fromAsync(async () => {
        interaction.client.emit(Events.ButtonInteractionRun, interaction, component, payload);

        const stopwatch = new Stopwatch();
        const result = await component.run(interaction, {
            logger,
            i18n: container.i18n.cloneInstance({
                interpolation: {
                    defaultVariables: {
                        authorUsername: interaction.user.username,
                        authorMention: userMention(interaction.user.id),
                    },
                },
            }),
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
