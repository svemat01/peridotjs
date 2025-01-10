import { PrefixedStrategy } from '@sapphire/lexure';
import { Option } from '@sapphire/result';

/**
 * Configuration options for the flag parsing strategy.
 * @since 0.2.6
 * @category Arguments
 */
export type FlagStrategyOptions = {
    /**
     * The accepted flags. Flags are key-only identifiers that can be placed anywhere in the command.
     * @example
     * ```typescript
     * // Only accept specific flags
     * flags: ['silent', 'force', 'dry-run']
     * 
     * // Accept any flag
     * flags: true
     * 
     * // Accept no flags
     * flags: false
     * ```
     * @default []
     */
    flags?: readonly string[] | boolean;

    /**
     * The accepted options. Options are key-value identifiers that can be placed anywhere in the command.
     * @example
     * ```typescript
     * // Only accept specific options
     * options: ['user', 'reason', 'duration']
     * 
     * // Accept any option
     * options: true
     * 
     * // Accept no options
     * options: false
     * ```
     * @default []
     */
    options?: readonly string[] | boolean;

    /**
     * The prefixes that indicate a flag or option.
     * @example ['--', '-', '—']
     * @default ['--', '-', '—']
     */
    prefixes?: string[];

    /**
     * The characters that can separate option keys from values.
     * @example ['=', ':']
     * @default ['=', ':']
     */
    separators?: string[];
};

/**
 * Helper function that always returns Option.none
 * @internal
 */
const never = () => Option.none;

/**
 * Helper function that always returns true
 * @internal
 */
const always = () => true;

/**
 * A strategy for parsing unordered flags and options in command arguments.
 * Extends Sapphire's PrefixedStrategy with support for allowed flags and options.
 * @since 0.2.6
 * @category Arguments
 * @example
 * ```typescript
 * const strategy = new FlagUnorderedStrategy({
 *   flags: ['silent', 'force'],
 *   options: ['user', 'reason'],
 *   prefixes: ['--', '-'],
 *   separators: ['=', ':']
 * });
 * 
 * // These would be valid:
 * // --silent --user=John
 * // -force --reason="Left server"
 * // --user:John --silent
 * ```
 */
export class FlagUnorderedStrategy extends PrefixedStrategy {
    /**
     * The list of allowed flags, or true to allow all flags.
     */
    public readonly flags: readonly string[] | true;

    /**
     * The list of allowed options, or true to allow all options.
     */
    public readonly options: readonly string[] | true;

    /**
     * Creates a new FlagUnorderedStrategy instance.
     * @param options - Configuration options for the strategy
     */
    public constructor({ flags, options, prefixes = ['--', '-', '—'], separators = ['=', ':'] }: FlagStrategyOptions = {}) {
        super(prefixes, separators);
        this.flags = flags || [];
        this.options = options || [];

        if (this.flags === true) this.allowedFlag = always;
        else if (this.flags.length === 0) this.matchFlag = never;

        if (this.options === true) {
            this.allowedOption = always;
        } else if (this.options.length === 0) {
            this.matchOption = never;
        }
    }

    /**
     * Attempts to match a string as a flag.
     * @param s - The string to match
     * @returns An Option containing the flag name if matched, or None if not matched
     * @override
     */
    public override matchFlag(s: string): Option<string> {
        const result = super.matchFlag(s);

        // The flag must be an allowed one.
        if (result.isSomeAnd((value) => this.allowedFlag(value))) return result;

        // If it did not match a flag, return null.
        return Option.none;
    }

    /**
     * Attempts to match a string as an option.
     * @param s - The string to match
     * @returns An Option containing the option key and value if matched, or None if not matched
     * @override
     */
    public override matchOption(s: string): Option<readonly [key: string, value: string]> {
        const result = super.matchOption(s);

        if (result.isSomeAnd((option) => this.allowedOption(option[0]))) return result;

        return Option.none;
    }

    /**
     * Checks if a flag is in the list of allowed flags.
     * @param s - The flag to check
     * @returns Whether the flag is allowed
     * @private
     */
    private allowedFlag(s: string) {
        return (this.flags as readonly string[]).includes(s);
    }

    /**
     * Checks if an option is in the list of allowed options.
     * @param s - The option to check
     * @returns Whether the option is allowed
     * @private
     */
    private allowedOption(s: string) {
        return (this.options as readonly string[]).includes(s);
    }
}
