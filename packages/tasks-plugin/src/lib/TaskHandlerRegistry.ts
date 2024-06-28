import { type CommonContext, container, type HandlerRegistry } from '@peridotjs/framework';
import type { Awaitable } from '@sapphire/utilities';
import { FlowProducer, Job, type JobsOptions,Queue, type QueueOptions, Worker, type WorkerOptions } from 'bullmq';

type JobExecutor<Queue extends QueueName> = {
    queue: Queue;
    workerOptions?: WorkerOptions;
    run: JobExecutorRun<Queue, CommonContext>;
};

type JobExecutorRun<Queue extends QueueName, Context extends CommonContext> = (
    job: Job<Queues[Queue]['payload'], Queues[Queue]['response']>,
    ctx: Context,
) => Promise<Queues[Queue]['response']>;

export class TaskHandlerRegistry implements HandlerRegistry<JobExecutor<QueueName>> {
    public readonly name = 'tasks';

    private workers = new Map<string, Worker>();
    private queues = new Map<string, Queue>();
    private executors = new Map<string, JobExecutor<QueueName>>();

    private flowProducer: FlowProducer | null = null;

    public _register(executor: JobExecutor<QueueName>): this {
        this.executors.set(executor.queue, executor);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const worker = new Worker(executor.queue, this.run, executor.workerOptions, container.redis as any);
        this.workers.set(executor.queue, worker);

        return this;
    }

    public async _unregister(handler: JobExecutor<QueueName>): Promise<this> {
        const worker = this.workers.get(handler.queue);

        if (worker) {
            await worker.close();
            this.workers.delete(handler.queue);
        }

        this.executors.delete(handler.queue);

        return this;
    }

    public _unregisterAll(): Awaitable<this> {
        return Promise.all([...this.executors.values()].map((executor) => this._unregister(executor))).then(() => this);
    }

    private async run(job: Job) {
        const executor = this.executors.get(job.queueName);

        if (!executor) {
            throw new Error(`No executor found for queue ${job.queueName}`);
        }

        const context = {
            logger: container.logger.child({
                task: executor.queue,
                jobId: job.id,
            }),
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return executor.run(job as any, context);
    }

    public getQueue<QueueT extends QueueName>(queueName: QueueT, options?: QueueOptions): Queue<Queues[QueueT]['payload'], Queues[QueueT]['response']>{
        let queue = this.queues.get(queueName);

        if (!queue) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            queue = new Queue(queueName, options, container.redis as any);
            this.queues.set(queueName, queue);
        }

        return queue;
    }

    public getWorker(queueName: QueueName): Worker | undefined {
        return this.workers.get(queueName);
    }

    public getFlowProducer(): FlowProducer {
        if (!this.flowProducer) {
            this.flowProducer = new FlowProducer({
                connection: container.redis,
            });
        }

        return this.flowProducer;
    }

    public async close(): Promise<void> {
        await Promise.all([...this.workers.values()].map((worker) => worker.close()));
        await Promise.all([...this.queues.values()].map((queue) => queue.close()));
    }

    public async create<QueueT extends QueueName>(queueName: QueueT, jobName: string, data: Queues[QueueT]['payload'], options?: JobsOptions) {
        const queue = this.getQueue(queueName);
        return queue.add(jobName, data, options);
    }
}

declare module '@peridotjs/framework' {
    interface HandlerRegistries {
        tasks: TaskHandlerRegistry;
    }
}

export interface Queues {
}

export type QueueName = keyof Queues;
