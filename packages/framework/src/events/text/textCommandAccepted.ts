import type { IUnorderedStrategy } from '@sapphire/lexure';
import { ArgumentStream, Lexer, Parser } from '@sapphire/lexure';
import { Result } from '@sapphire/result';
import { Stopwatch } from '@sapphire/stopwatch';

import { FlagUnorderedStrategy } from '../../arguments/FlagStrategy.js';
import { Args } from '../../arguments/Parser.js';
import type { TextCommandMessage } from '../../handlers/TextCommand.js';
import type { TextCommandAcceptedPayload } from '../index.js';
import { Events } from '../index.js';

export async function onTextCommandAccepted(payload: TextCommandAcceptedPayload) {
    const { message, command, parameters, logger } = payload;
    const args = messagePreParse(message, parameters, new FlagUnorderedStrategy(command.data.strategy));

    logger.trace('TextCommandAccepted');

    const result = await Result.fromAsync(async () => {
        message.client.emit(Events.TextCommandRun, message, command, {
            ...payload,
            args,
        });

        const stopwatch = new Stopwatch();

        const result = await command.run(message, {
            args,
            logger,
        });
        const { duration } = stopwatch.stop();

        message.client.emit(Events.TextCommandSuccess, {
            ...payload,
            args,
            result,
            duration,
        });

        return duration;
    });

    // Handle errors with command.onError if it exists, otherwise emit error event
    result.inspectErr(async (error) => {
        if (command.onError) {
            try {
                await command.onError(error, { args, logger });
            } catch (handlerError) {
                // If the error handler throws, emit that as the error instead
                message.client.emit(Events.TextCommandError, handlerError, {
                    ...payload,
                    args,
                    duration: -1,
                });
            }
            return;
        }

        // No custom error handler, emit the standard error event
        message.client.emit(Events.TextCommandError, error, {
            ...payload,
            args,
            duration: -1,
        });
    });

    message.client.emit(Events.TextCommandFinish, message, command, {
        ...payload,
        args,
        success: result.isOk(),
        duration: result.unwrapOr(-1),
    });
}

const lexer = new Lexer({
    quotes: [
        ['"', '"'], // Double quotes
        ['“', '”'], // Fancy quotes (on iOS)
        ['「', '」'], // Corner brackets (CJK)
        ['«', '»'], // French quotes (guillemets)
    ],
});

function messagePreParse(message: TextCommandMessage, parameters: string, strategy?: IUnorderedStrategy) {
    const parser = new Parser(strategy);
    const args = new ArgumentStream(parser.run(lexer.run(parameters)));
    return new Args(message, args);
}
