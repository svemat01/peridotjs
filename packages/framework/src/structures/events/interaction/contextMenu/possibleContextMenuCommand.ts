import type { ClientEvents } from 'discord.js';

import { container } from '../../../index.js';
import { Events } from '../../events.js';

export const onPossibleContextMenuCommand = ((interaction) => {
    const { client, logger, contextMenuCommands } = container;

    const command = contextMenuCommands.get(interaction.commandName);
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
