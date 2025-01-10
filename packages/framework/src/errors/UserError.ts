/**
 * The UserError class to be emitted in the pieces.
 * @property name This will be `'UserError'` and can be used to distinguish the type of error when any error gets thrown
 * @example
 * ```typescript
 * throw new UserError({
 *   identifier: 'AddArgumentError',
 *   message: 'You must write two numbers, but the second one did not match.',
 *   context: { received: 2, expected: 3 }
 * });
 * ```
 */
export class UserError extends Error {
    /**
     * An identifier, useful to localize emitted errors.
     */
    public readonly identifier: string;

    /**
     * User-provided context.
     */
    public readonly context: unknown;

    /**
     * Constructs an UserError.
     * @param options The UserError options
     */
    public constructor(options: UserError.Options) {
        super(options.message);
        this.identifier = options.identifier;
        this.context = options.context ?? null;
    }

    public override get name(): string {
        return 'UserError';
    }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace UserError {
    /**
     * The options for {@link UserError}.
     * @since 0.2.6
     */
    export type Options = {
        /**
         * The identifier for this error.
         * @since 0.2.6
         */
        identifier: string;

        /**
         * The message to be passed to the Error constructor.
         * @since 0.2.6
         */
        message?: string;

        /**
         * The extra context to provide more information about this error.
         * @since 0.2.6
         * @default null
         */
        context?: unknown;
    };
}
