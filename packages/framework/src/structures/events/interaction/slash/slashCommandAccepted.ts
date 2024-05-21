import { Result } from '@sapphire/result';
import { Stopwatch } from '@sapphire/stopwatch';
import { userMention } from 'discord.js';

import { container } from '../../../container.js';
import { Events, type SlashCommandAcceptedPayload } from '../../events.js';


export async function onSlashCommandAccepted(payload: SlashCommandAcceptedPayload) {
    const { interaction, command, logger } = payload;

    logger.trace('SlashCommandAccepted');

    const result = await Result.fromAsync(async () => {
        interaction.client.emit(Events.SlashCommandRun, interaction, command,  payload);

        const stopwatch = new Stopwatch();
        const result = await command.run(interaction, {
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

        interaction.client.emit(Events.SlashCommandSuccess, {
            ...payload,
            result,
            duration,
        });

        return duration;
    });

    result.inspectErr((error) =>
        interaction.client.emit(Events.SlashCommandError, error, {
            ...payload,
            duration: -1,
        }),
    );

    interaction.client.emit(Events.SlashCommandFinish, interaction, command, {
        ...payload,
        success: result.isOk(),
        duration: result.unwrapOr(-1),
    });
}
