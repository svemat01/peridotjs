import { Result } from '@sapphire/result';
import { Stopwatch } from '@sapphire/stopwatch';
import { type AutocompleteInteraction, userMention } from 'discord.js';

import { container } from '../../../structures/index.js';
import { Events } from '../../index.js';

export async function onPossibleAutocompleteInteraction(interaction: AutocompleteInteraction) {
    const {
        client,
        handlers: { slashCommands },
    } = container;

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
            get i18n() {
                // @ts-expect-error Hack to make it a lazy value
                delete this.i18n;
                this.i18n = container.i18n.cloneInstance({
                    interpolation: {
                        defaultVariables: {
                            authorUsername: interaction.user.username,
                            authorMention: userMention(interaction.user.id),
                        },
                    },
                });
                return this.i18n;
            },
        });
        const { duration } = stopwatch.stop();

        interaction.client.emit(Events.AutocompleteInteractionSuccess, {
            command,
            interaction,
            logger,
            duration,
            result,
        });

        return duration;
    });

    result.inspectErr((error) =>
        interaction.client.emit(Events.AutocompleteInteractionError, error, {
            command,
            interaction,
            logger,
            duration: -1,
        }),
    );
}
