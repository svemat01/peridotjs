import type { IArgument } from '../arguments/types.js';
import { UserError } from './UserError.js';

/**
 * Errors thrown by the argument parser
 * @since 0.2.6
 * @property name This will be `'ArgumentError'` and can be used to distinguish the type of error when any error gets thrown
 */
export class ArgumentError<T = unknown> extends UserError {
    public readonly argument: IArgument<T>;
    public readonly parameter: string;

    public constructor(options: ArgumentError.Options<T>) {
        super({ ...options, identifier: options.identifier ?? options.argument.name });
        this.argument = options.argument;
        this.parameter = options.parameter;
    }

    public override get name(): string {
        return 'ArgumentError';
    }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ArgumentError {
    /**
     * The options for {@link ArgumentError}.
     * @since 0.2.6
     */
    export type Options<T> = {
        /**
         * The argument that caused the error.
         * @since 0.2.6
         */
        argument: IArgument<T>;

        /**
         * The parameter that failed to be parsed.
         * @since 0.2.6
         */
        parameter: string;

        /**
         * The identifier.
         * @since 0.2.6
         * @default argument.name
         */
        identifier?: string;
    } & Omit<UserError.Options, 'identifier'>;
}
