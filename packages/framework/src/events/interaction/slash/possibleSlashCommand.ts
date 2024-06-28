import type { ClientEvents } from 'discord.js';

import { container } from '../../../structures/index.js';
import { Events } from '../../index.js';

export const onPossibleSlashCommand = ((interaction) => {
    const { client, logger, handlers } = container;

    const command = handlers.getRegistry('slashCommands').unwrap().getHandler(interaction.commandName).unwrapOr(undefined);
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
