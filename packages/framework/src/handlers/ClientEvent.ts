import type { ClientEvents } from 'discord.js';

/**
 * Represents the function signature for running a client event.
 * @since 0.2.6
 * @category Events
 * @template T - The type of the client event from Discord.js ClientEvents
 * @example
 * ```typescript
 * const ready: ClientEventRun<'ready'> = (client) => {
 *   console.log(`Logged in as ${client.user.tag}!`);
 * };
 * ```
 * @see {@link https://discord.js.org/#/docs/discord.js/main/typedef/ClientEvents}
 */
export type ClientEventRun<T extends keyof ClientEvents> = (...args: ClientEvents[T]) => void | Promise<void>;

/**
 * Represents a Discord.js client event handler.
 * @since 0.2.6
 * @category Events
 * @template T - The type of the client event from Discord.js ClientEvents
 * @example
 * ```typescript
 * const readyEvent: ClientEvent<'ready'> = {
 *   name: 'ready',
 *   type: 'once',
 *   run: (client) => {
 *     console.log(`Logged in as ${client.user.tag}!`);
 *   }
 * };
 * ```
 * @see {@link https://discord.js.org/#/docs/discord.js/main/typedef/ClientEvents}
 */
export type ClientEvent<T extends keyof ClientEvents> = {
    /**
     * The name of the event from Discord.js ClientEvents.
     * @see {@link https://discord.js.org/#/docs/discord.js/main/typedef/ClientEvents}
     */
    name: T;

    /**
     * Determines how the event should be registered.
     * - 'on': The event will be triggered every time it occurs
     * - 'once': The event will only be triggered the first time it occurs
     */
    type: 'on' | 'once';

    /**
     * The function to execute when the event is triggered.
     * @see {@link ClientEventRun}
     */
    run: ClientEventRun<T>;
};
