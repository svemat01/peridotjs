import type { CommonContext } from '@peridotjs/framework';

type TaskHandlerContext = CommonContext;

export type JobExecutor = {
    queue: string;
    run: (ctx: TaskHandlerContext) => Promise<void>;
}