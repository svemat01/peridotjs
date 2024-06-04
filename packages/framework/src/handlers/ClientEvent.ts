import type { ClientEvents } from 'discord.js';

/**
 * Represents the function signature for running a client event.
 * @template T - The type of the client event.
 * @template C - The type of additional context properties.
 */
export type ClientEventRun<T extends keyof ClientEvents> = (
    ...args: ClientEvents[T]
) => void | Promise<void>;

/**
 * Represents a client event.
 * @template T - The type of the client event.
 */
export type ClientEvent<T extends keyof ClientEvents> = {
    /**
     * The name of the event.
     */
    name: T;
    /**
     * When to run the event.
     */
    type: 'on' | 'once';
    /**
     * The function to run when the event is triggered.
     */
    run: ClientEventRun<T>;
};
