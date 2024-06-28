import type { ClientEvents } from 'discord.js';

import { container } from '../../../structures/index.js';
import { Events } from '../../index.js';

export const onPossibleModalSubmitInteraction = ((interaction) => {
    const {
        client,
        logger,
        handlers,
    } = container;

    const component = handlers.getRegistry('modalComponents').unwrap().getHandler(interaction.customId).unwrapOr(undefined);

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
