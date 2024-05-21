import type { ClientEvents } from 'discord.js';

import { container } from '../../../index.js';
import { Events } from '../../events.js';

export const onPossibleModalSubmitInteraction = ((interaction) => {
    const { client, logger, modals } = container;

    const component = modals.find((b) => {
        if (typeof b.customId === 'string') return b.customId === interaction.customId;
        return b.customId.test(interaction.customId);
    });

    if (!component) {
        client.emit(Events.UnknownModalSubmitInteraction, { interaction });

        return;
    }

    const cmpLogger = logger.child({
        type: 'slashCmd',
        src: interaction.id,
        user: interaction.user.id,
        cmp: interaction.customId,
    });

    client.emit(Events.PreModalSubmitInteractionRun, { interaction, component, logger: cmpLogger });
}) satisfies (...args: ClientEvents[typeof Events.PossibleModalSubmitInteraction]) => void;
