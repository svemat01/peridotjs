import { userMention, type AutocompleteInteraction, type ClientEvents } from 'discord.js';

import { container } from '../../../index.js';
import { Events } from '../../events.js';
import { Result } from '@sapphire/result';
import { Stopwatch } from '@sapphire/stopwatch';

export async function onPossibleAutocompleteInteraction(interaction: AutocompleteInteraction) {
    const { client, slashCommands } = container;

    const command = slashCommands.get(interaction.commandName);
    if (!command || !command.autocomplete) {
        return;
    }
    const logger = container.logger.child({
        type: 'autocompleteI',
        src: interaction.id,
        user: interaction.user.id,
        cmd: interaction.commandName,
    });


    const result = await Result.fromAsync(async () => {
        const stopwatch = new Stopwatch();
        const result = await command.autocomplete!(interaction, {
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

        interaction.client.emit(Events.AutocompleteInteractionSuccess, {
            command,
            interaction,
            logger,
        });

        return duration;
    });

    result.inspectErr((error) =>
        interaction.client.emit(Events.SlashCommandError, error, {
            command,
            interaction,
            logger,
            duration: -1,
        }),
    );
}
