import type { ClientEvents } from 'discord.js';

import { container } from '../../../structures/index.js';
import { Events } from '../../index.js';

export const onPossibleContextMenuCommand = ((interaction) => {
    const { client, logger, handlers } = container;

    const command = handlers.getRegistry('contextMenuCommands').unwrap().getHandler(interaction.commandName).unwrapOr(undefined);
    if (!command) {
        client.emit(Events.UnknownContextMenuCommand, { interaction });

        return;
    }
    const cmdLogger = logger.child({
        type: 'contextMenuCmd',
        src: interaction.id,
        user: interaction.user.id,
        cmd: interaction.commandName,
    });

    client.emit(Events.PreContextMenuCommandRun, { interaction, command, logger: cmdLogger });
}) satisfies (...args: ClientEvents[typeof Events.PossibleContextMenuCommand]) => void;
