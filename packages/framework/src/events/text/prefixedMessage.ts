import type { Message } from 'discord.js';

import { container } from '../../structures/container.js';
import { Events } from '../index.js';

export function onPrefixedMessage(message: Message, prefix: string | RegExp) {
    const {
        client,
        handlers: { textCommands },
        logger,
    } = container;
    container.logger.trace({ src: message.id, prefix }, 'Prefixed received');
    // Retrieve the command name and validate:
    const commandPrefix = getCommandPrefix(message.content, prefix);
    const prefixLess = message.content.slice(commandPrefix.length).trim();

    // The character that separates the command name from the arguments, this will return -1 when '[p]command' is
    // passed, and a non -1 value when '[p]command arg' is passed instead.
    const spaceIndex = prefixLess.indexOf(' ');
    const commandName = spaceIndex === -1 ? prefixLess : prefixLess.slice(0, spaceIndex);
    if (commandName.length === 0) {
        client.emit(Events.UnknownTextCommandName, { message, prefix, commandPrefix });
        return;
    }

    // Retrieve the command and validate:
    const command = textCommands.get(commandName);
    if (!command) {
        client.emit(Events.UnknownTextCommand, { message, prefix, commandName, commandPrefix });
        return;
    }

    // Run the last stage before running the command:
    const parameters = spaceIndex === -1 ? '' : prefixLess.substring(spaceIndex + 1).trim();

    const cmdLogger = logger.child({
        type: 'txtCmd',
        src: message.id,
        user: message.author.id,
        cmd: commandName,
    });

    client.emit(Events.PreTextCommandRun, {
        message,
        command,
        parameters,
        logger: cmdLogger,
    });
}

function getCommandPrefix(content: string, prefix: string | RegExp): string {
    return typeof prefix === 'string' ? prefix : prefix.exec(content)![0];
}
