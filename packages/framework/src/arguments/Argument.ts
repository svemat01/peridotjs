import { Result } from '@sapphire/result';

import { ArgumentError } from '../errors/ArgumentError.js';
import type { ArgumentContext, ArgumentOptions, ArgumentResult, AwaitableArgumentResult, IArgument } from './types.js';

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
 *   public run(argument: string, context: ArgumentContext): ArgumentResult<URL> {
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
export abstract class Argument<T = unknown, Options extends ArgumentOptions = ArgumentOptions> implements IArgument<T> {
    public readonly name: string;
    public constructor(options: Options = {} as Options) {
        this.name = options.name;
    }

    public abstract run(parameter: string, context: ArgumentContext<T>): AwaitableArgumentResult<T>;

    /**
     * Wraps a value into a successful value.
     * @param value The value to wrap.
     */
    public ok(value: T): ArgumentResult<T> {
        return Result.ok(value);
    }

    /**
     * Constructs an {@link Err} result containing an {@link ArgumentError} with a custom type.
     * @param options The options to pass to the ArgumentError.
     */
    public error(options: Omit<ArgumentError.Options<T>, 'argument'>): ArgumentResult<T> {
        return Result.err(
            new ArgumentError({
                argument: this,
                identifier: this.name,
                ...options,
            }),
        );
    }
}
