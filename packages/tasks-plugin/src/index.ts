import { Redis, type RedisOptions } from 'ioredis';

import type { TaskHandlerRegistry } from './lib/TaskHandlerRegistry.js';

export * from './lib/index.js';

declare module '@peridotjs/framework' {
    interface Container {
        redis: Redis;
        tasks: TaskHandlerRegistry;
    }

    interface HandlerRegistries {
        tasks: TaskHandlerRegistry;
    }
}

declare module 'discord.js' {
    export interface ClientOptions {
        redis: RedisOptions | Redis;

        loadTaskListeners?: boolean;
    }
}
