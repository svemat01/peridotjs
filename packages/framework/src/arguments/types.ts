import type { Result } from '@sapphire/result';
import type { Awaitable } from '@sapphire/utilities';
import type { Message } from 'discord.js';

import type { ArgumentError } from '../errors/ArgumentError.js';
import type { Args } from './Parser.js';

/**
 * Defines a synchronous result of an argument parsing operation.
 * @since 0.2.6
 * @category Arguments
 * @template T - The type of the successfully parsed value
 * @see {@link AsyncArgumentResult} for the asynchronous version
 * @example
 * ```typescript
 * const result: ArgumentResult<number> = Ok(42);
 * // or
 * const result: ArgumentResult<number> = Err(new ArgumentError('Invalid number'));
 * ```
 */
export type ArgumentResult<T> = Result<T, ArgumentError<T>>;

/**
 * Defines a synchronous or asynchronous result of an argument parsing operation.
 * @since 0.2.6
 * @category Arguments
 * @template T - The type of the successfully parsed value
 * @see {@link ArgumentResult} for the synchronous version
 * @see {@link AsyncArgumentResult} for the strictly asynchronous version
 */
export type AwaitableArgumentResult<T> = Awaitable<ArgumentResult<T>>;

/**
 * Defines an asynchronous result of an argument parsing operation.
 * @since 0.2.6
 * @category Arguments
 * @template T - The type of the successfully parsed value
 * @see {@link ArgumentResult} for the synchronous version
 * @example
 * ```typescript
 * const result: AsyncArgumentResult<User> = Promise.resolve(Ok(user));
 * ```
 */
export type AsyncArgumentResult<T> = Promise<ArgumentResult<T>>;

/**
 * Interface for argument type definitions.
 * Used to define how string arguments should be parsed into typed values.
 * @since 0.2.6
 * @category Arguments
 * @template T - The type that this argument parser produces
 * @example
 * ```typescript
 * const NumberArgument: IArgument<number> = {
 *   name: 'number',
 *   run: (parameter, context) => {
 *     const parsed = Number(parameter);
 *     return isNaN(parsed)
 *       ? Err(new ArgumentError('Not a valid number'))
 *       : Ok(parsed);
 *   }
 * };
 * ```
 */
export type IArgument<T> = {
    /**
     * The name of the argument, used for identification and error messages.
     * @example 'number', 'user', 'duration'
     */
    readonly name: string;

    /**
     * Parses a string parameter into the target type.
     * @param parameter - The raw string input to parse
     * @param context - Context object containing the message and other parsing options
     * @returns A Result containing either the parsed value or an error
     * @throws {ArgumentError} When the parameter cannot be parsed into the target type
     */
    run(parameter: string, context: ArgumentContext<T>): AwaitableArgumentResult<T>;
};

/**
 * Configuration options for creating a new argument type.
 * @since 0.2.6
 * @category Arguments
 */
export type ArgumentOptions = {
    /**
     * The name of the argument type.
     * Used for identification and error messages.
     */
    name: string;
};

/**
 * Context object passed to argument parsers.
 * Contains the original message and parsing options.
 * @since 0.2.6
 * @category Arguments
 * @template T - The type that the argument parser produces
 */
export type ArgumentContext<T = unknown> = {
    /**
     * The argument parser being used.
     */
    argument: IArgument<T>;

    /**
     * The Args instance containing all command arguments.
     */
    args: Args;

    /**
     * The Discord.js message that triggered the command.
     */
    message: Message;

    /**
     * The minimum value for number-based arguments.
     */
    minimum?: number;

    /**
     * The maximum value for number-based arguments.
     */
    maximum?: number;

    /**
     * Whether the minimum/maximum bounds are inclusive.
     * @default true
     */
    inclusive?: boolean;
} & Record<PropertyKey, unknown>;
