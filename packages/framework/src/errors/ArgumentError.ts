import type { IArgument } from '../arguments/types.js';
import { UserError } from './UserError.js';

/**
 * Errors thrown by the argument parser
 * @since 1.0.0
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
     * @since 1.0.0
     */
    export type Options<T> = {
        /**
         * The argument that caused the error.
         * @since 1.0.0
         */
        argument: IArgument<T>;

        /**
         * The parameter that failed to be parsed.
         * @since 1.0.0
         */
        parameter: string;

        /**
         * The identifier.
         * @since 1.0.0
         * @default argument.name
         */
        identifier?: string;
    } & Omit<UserError.Options, 'identifier'>;
}
