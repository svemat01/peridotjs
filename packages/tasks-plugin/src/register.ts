import './index.js';

import { container, PeridotClient, Plugin, postLogin, preGenericsInitialization } from '@peridotjs/framework';
import type { ClientOptions } from 'discord.js';
import { Redis } from 'ioredis';

import { registerTaskEventListeners } from './lib/listeners.js';
import { TaskHandlerRegistry } from './lib/TaskHandlerRegistry.js';

export class TasksPlugin extends Plugin {
    public static [preGenericsInitialization](this: PeridotClient, options: ClientOptions): void {
        if (options.redis instanceof Redis) {
            container.redis = options.redis;
        } else {
            container.redis = new Redis(options.redis);
        }

        container.tasks = new TaskHandlerRegistry();
        container.handlers.registerRegistry(container.tasks);

        if (options.loadTaskListeners !== false) {
            registerTaskEventListeners();
        }
    }

    public static [postLogin](this: PeridotClient): void {
        void container.tasks.setupRepeating();
    }
}

PeridotClient.plugins.registerPostInitializationHook(TasksPlugin[preGenericsInitialization], 'Tasks-PreGenericsInitialization');
PeridotClient.plugins.registerPostLoginHook(TasksPlugin[postLogin], 'Tasks-PostLogin');
