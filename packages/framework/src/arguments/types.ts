import type { Result } from '@sapphire/result';
import type { Awaitable } from '@sapphire/utilities';
import type { Message } from 'discord.js';

import type { ArgumentError } from '../errors/ArgumentError.js';
import type { Args } from './Parser.js';

/**
 * Defines a synchronous result of an {@link Argument}, check {@link AsyncArgumentResult} for the asynchronous version.
 */
export type ArgumentResult<T> = Result<T, ArgumentError<T>>;

/**
 * Defines a synchronous or asynchronous result of an {@link Argument}, check {@link AsyncArgumentResult} for the asynchronous version.
 */
export type AwaitableArgumentResult<T> = Awaitable<ArgumentResult<T>>;

/**
 * Defines an asynchronous result of an {@link Argument}, check {@link ArgumentResult} for the synchronous version.
 */
export type AsyncArgumentResult<T> = Promise<ArgumentResult<T>>;

export type IArgument<T> = {
    /**
     * The name of the argument, this is used to make the identification of an argument easier.
     */
    readonly name: string;

    /**
     * The method which is called when invoking the argument.
     * @param parameter The string parameter to parse.
     * @param context The context for the method call, contains the message, command, and other options.
     */
    run(parameter: string, context: ArgumentContext<T>): AwaitableArgumentResult<T>;
};


export type ArgumentOptions = {
    name: string;
};

export type ArgumentContext<T = unknown> = {
    argument: IArgument<T>;
    args: Args;
    message: Message;
    minimum?: number;
    maximum?: number;
    inclusive?: boolean;
} & Record<PropertyKey, unknown>;
