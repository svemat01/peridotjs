import type { MessageResolverOptions } from '../resolvers/message.js';
import type { ArgumentContext } from './types.js';

/**
 * Context options for the enum argument type.
 * Used to configure how enum values are parsed and matched.
 * @since 0.2.6
 * @category Arguments
 * @example
 * ```typescript
 * const context: EnumArgumentContext = {
 *   enum: ['red', 'green', 'blue'],
 *   caseInsensitive: true
 * };
 * ```
 */
export type EnumArgumentContext = {
    /**
     * The list of valid enum values to match against.
     * @example ['red', 'green', 'blue']
     */
    readonly enum?: string[];

    /**
     * Whether to ignore case when matching enum values.
     * When true, 'RED' will match 'red'.
     * @default false
     */
    readonly caseInsensitive?: boolean;
} & ArgumentContext;

/**
 * Context options for the boolean argument type.
 * Used to configure what values are considered true or false.
 * @since 0.2.6
 * @category Arguments
 * @example
 * ```typescript
 * const context: BooleanArgumentContext = {
 *   truths: ['yes', 'on', 'enable'],
 *   falses: ['no', 'off', 'disable']
 * };
 * ```
 */
export type BooleanArgumentContext = {
    /**
     * Additional words that should resolve to `true`.
     * These are merged with the default true values:
     * - '1', 'true', '+', 't', 'yes', 'y'
     * @example ['on', 'enable', 'active']
     */
    readonly truths?: string[];

    /**
     * Additional words that should resolve to `false`.
     * These are merged with the default false values:
     * - '0', 'false', '-', 'f', 'no', 'n'
     * @example ['off', 'disable', 'inactive']
     */
    readonly falses?: string[];
} & ArgumentContext;

/**
 * Context options for the member argument type.
 * Used to configure how guild members are resolved from arguments.
 * @since 0.2.6
 * @category Arguments
 * @example
 * ```typescript
 * const context: MemberArgumentContext = {
 *   performFuzzySearch: true
 * };
 * ```
 * @requires Discord.js v14 or higher
 */
export type MemberArgumentContext = {
    /**
     * Whether to perform a fuzzy search when resolving members.
     * When true, partial matches and similar usernames will be considered.
     * Uses Discord's built-in member search functionality.
     * @default true
     */
    readonly performFuzzySearch?: boolean;
} & ArgumentContext;

/**
 * Context options for the message argument type.
 * Used to configure how messages are resolved from arguments.
 * @since 0.2.6
 * @category Arguments
 * @example
 * ```typescript
 * const context: MessageArgumentContext = {
 *   channel: someChannel,
 *   fetchLimit: 100
 * };
 * ```
 * @requires Discord.js v14 or higher
 * @see {@link MessageResolverOptions}
 */
export type MessageArgumentContext = Omit<MessageResolverOptions, 'messageOrInteraction'> & ArgumentContext;
