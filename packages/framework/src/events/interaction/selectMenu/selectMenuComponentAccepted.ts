import { Result } from '@sapphire/result';
import { Stopwatch } from '@sapphire/stopwatch';
import { userMention } from 'discord.js';

import { container } from '../../../structures/container.js';
import { Events, type SelectMenuInteractionAcceptedPayload } from '../../index.js';

export async function onSelectMenuInteractionAccepted(payload: SelectMenuInteractionAcceptedPayload) {
    const { interaction, component, logger } = payload;

    logger.trace('SelectMenuInteractionAccepted');

    const result = await Result.fromAsync(async () => {
        interaction.client.emit(Events.SelectMenuInteractionRun, interaction, component, payload);

        const stopwatch = new Stopwatch();
        const result = await component.run(interaction, {
            logger,
            i18n: () =>
                container.i18n.cloneInstance({
                    interpolation: {
                        defaultVariables: {
                            authorUsername: interaction.user.username,
                            authorMention: userMention(interaction.user.id),
                        },
                    },
                }),
        });
        const { duration } = stopwatch.stop();

        interaction.client.emit(Events.SelectMenuInteractionSuccess, {
            ...payload,
            result,
            duration,
        });

        return duration;
    });

    result.inspectErr((error) =>
        interaction.client.emit(Events.SelectMenuInteractionError, error, {
            ...payload,
            duration: -1,
        }),
    );

    interaction.client.emit(Events.SelectMenuInteractionFinish, interaction, component, {
        ...payload,
        success: result.isOk(),
        duration: result.unwrapOr(-1),
    });
}
