import type { ClientEvents } from 'discord.js';

import { container } from '../../../structures/index.js';
import { Events } from '../../index.js';

export const onPossibleSelectMenuInteraction = ((interaction) => {
    const {
        client,
        logger,
        handlers,
    } = container;

    const component = handlers.getRegistry('selectMenuComponents').unwrap().getHandler(interaction.customId).unwrapOr(undefined);

    if (!component) {
        client.emit(Events.UnknownSelectMenuInteraction, { interaction });

        return;
    }

    const cmpLogger = logger.child({
        type: 'slashCmd',
        src: interaction.id,
        user: interaction.user.id,
        cmp: interaction.customId,
    });

    client.emit(Events.PreSelectMenuInteractionRun, { interaction, component, logger: cmpLogger });
}) satisfies (...args: ClientEvents[typeof Events.PossibleSelectMenuInteraction]) => void;
