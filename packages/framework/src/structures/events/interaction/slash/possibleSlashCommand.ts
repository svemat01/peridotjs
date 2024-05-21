import type { ClientEvents } from 'discord.js';

import { container } from '../../../index.js';
import { Events } from '../../events.js';

export const onPossibleSlashCommand = ((interaction) => {
    const { client, logger, slashCommands } = container;

    const command = slashCommands.get(interaction.commandName);
    if (!command) {
        client.emit(Events.UnknownSlashCommand, { interaction });

        return;
    }
    const cmdLogger = logger.child({
        type: 'slashCmd',
        src: interaction.id,
        user: interaction.user.id,
        cmd: interaction.commandName,
    });

    client.emit(Events.PreSlashCommandRun, { interaction, command, logger: cmdLogger });
}) satisfies (...args: ClientEvents[typeof Events.PossibleSlashCommand]) => void;
