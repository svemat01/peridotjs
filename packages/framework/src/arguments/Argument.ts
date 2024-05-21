import type { Result } from '@sapphire/result';
import type { Awaitable } from '@sapphire/utilities';
import type { Message } from 'discord.js';

import type { ArgumentError } from '../errors/ArgumentError.js';
import { Args } from './Parser.js';
/**
 * Defines a synchronous result of an {@link Argument}, check {@link Argument.AsyncResult} for the asynchronous version.
 */
export type ArgumentResult<T> = Result<T, ArgumentError<T>>;

/**
 * Defines a synchronous or asynchronous result of an {@link Argument}, check {@link Argument.AsyncResult} for the asynchronous version.
 */
export type AwaitableArgumentResult<T> = Awaitable<ArgumentResult<T>>;

/**
 * Defines an asynchronous result of an {@link Argument}, check {@link Argument.Result} for the synchronous version.
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
    run(parameter: string, context: Argument.Context<T>): Argument.AwaitableResult<T>;
};

/**
 * The base argument class. This class is abstract and is to be extended by subclasses implementing the methods. In
 * Sapphire's workflow, arguments are called when using {@link Args}'s methods (usually used inside {@link Command}s by default).
 *
 * @example
 * ```typescript
 * // TypeScript:
 * import { Argument } from '@sapphire/framework';
 * import { URL } from 'node:url';
 *
 * // Define a class extending `Argument`, then export it.
 * // NOTE: You can use `export default` or `export =` too.
 * export class CoreArgument extends Argument<URL> {
 *   public constructor() {
 *     super({ name: 'hyperlink', aliases: ['url'] });
 *   }
 *
 *   public run(argument: string, context: Argument.Context): Argument.Result<URL> {
 *     try {
 *       return this.ok(new URL(argument));
 *     } catch {
 *       return this.error({
 *         parameter: argument,
 *         context,
 *         identifier: 'ArgumentHyperlinkInvalidURL',
 *         message: 'The argument did not resolve to a valid URL.'
 *       });
 *     }
 *   }
 * }
 *
 * // Augment the ArgType structure so `args.pick('url')`, `args.repeat('url')`
 * // and others have a return type of `URL`.
 * declare module '@sapphire/framework' {
 *   export interface ArgType {
 *     url: URL;
 *   }
 * }
 * ```
 *
 * @example
 * ```javascript
 * // JavaScript:
 * const { Argument } = require('@sapphire/framework');
 *
 * // Define a class extending `Argument`, then export it.
 * module.exports = class CoreArgument extends Argument {
 *   constructor(context) {
 *     super({ name: 'hyperlink', aliases: ['url'] });
 *   }
 *
 *   run(argument, context) {
 *     try {
 *       return this.ok(new URL(argument));
 *     } catch {
 *       return this.error({
 *         parameter: argument,
 *         context,
 *         identifier: 'ArgumentHyperlinkInvalidURL',
 *         message: 'The argument did not resolve to a valid URL.'
 *       });
 *     }
 *   }
 * }
 * ```
 */
export abstract class Argument<T = unknown, Options extends Argument.Options = Argument.Options> implements IArgument<T> {
    public readonly name: string;
    public constructor(options: Options = {} as Options) {
        this.name = options.name;
    }

    public abstract run(parameter: string, context: Argument.Context<T>): Argument.AwaitableResult<T>;

    /**
     * Wraps a value into a successful value.
     * @param value The value to wrap.
     */
    public ok(value: T): Argument.Result<T> {
        return Args.ok(value);
    }

    /**
     * Constructs an {@link Err} result containing an {@link ArgumentError} with a custom type.
     * @param options The options to pass to the ArgumentError.
     */
    public error(options: Omit<ArgumentError.Options<T>, 'argument'>): Argument.Result<T> {
        return Args.error({
            argument: this,
            identifier: this.name,
            ...options,
        });
    }
}

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

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Argument {
    export type Options = ArgumentOptions;
    export type Context<T = unknown> = ArgumentContext<T>;
    export type Result<T> = ArgumentResult<T>;
    export type AwaitableResult<T> = AwaitableArgumentResult<T>;
    export type AsyncResult<T> = AsyncArgumentResult<T>;
}
