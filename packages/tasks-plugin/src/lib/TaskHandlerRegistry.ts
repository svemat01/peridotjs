import { container, type HandlerRegistry } from '@peridotjs/framework';
import type { Awaitable } from '@sapphire/utilities';
import { FlowProducer, Job, type JobsOptions, Queue, type QueueOptions, type RepeatOptions, Worker, type WorkerOptions } from 'bullmq';

import { TaskEvents } from './types/Events.js';
import type { QueueName, Queues } from './types/Queue.js';
import type { TaskWorker } from './types/TaskWorker.js';

// @ts-expect-error When no queues are defined, the queue keys will be inferred as never which breaks the types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class TaskHandlerRegistry implements HandlerRegistry<TaskWorker<any>> {
    public readonly name = 'tasks';

    private workers = new Map<string, Worker>();
    private queues = new Map<string, Queue>();
    private executors = new Map<string, TaskWorker<QueueName>>();

    private _flowProducer: FlowProducer | null = null;

    private createWorker(queue: QueueName, workerOptions?: Omit<WorkerOptions, 'connection'>): Worker {
        const worker = new Worker(queue, this.run.bind(this), {
            ...workerOptions,
            connection: container.redis,
        });

        worker.on('active', (...args) => container.client.emit(TaskEvents.WorkerActive, queue, ...args));
        worker.on('closed', (...args) => container.client.emit(TaskEvents.WorkerClosed, queue, ...args));
        worker.on('closing', (...args) => container.client.emit(TaskEvents.WorkerClosing, queue, ...args));
        worker.on('completed', (...args) => container.client.emit(TaskEvents.WorkerCompleted, queue, ...args));
        worker.on('drained', (...args) => container.client.emit(TaskEvents.WorkerDrained, queue, ...args));
        worker.on('error', (...args) => container.client.emit(TaskEvents.WorkerError, queue, ...args));
        worker.on('failed', (...args) => container.client.emit(TaskEvents.WorkerFailed, queue, ...args));
        worker.on('paused', (...args) => container.client.emit(TaskEvents.WorkerPaused, queue, ...args));
        worker.on('progress', (...args) => container.client.emit(TaskEvents.WorkerProgress, queue, ...args));
        worker.on('ready', (...args) => container.client.emit(TaskEvents.WorkerReady, queue, ...args));
        worker.on('resumed', (...args) => container.client.emit(TaskEvents.WorkerResumed, queue, ...args));
        worker.on('stalled', (...args) => container.client.emit(TaskEvents.WorkerStalled, queue, ...args));

        return worker;
    }

    private createQueue(queueName: QueueName, queueOptions?: Omit<QueueOptions, 'connection'>): Queue {
        const queue = new Queue(queueName, {
            ...queueOptions,
            connection: container.redis,
        });

        queue.on('cleaned', (...args) => container.client.emit(TaskEvents.QueueCleaned, queueName, ...args));
        queue.on('error', (...args) => container.client.emit(TaskEvents.QueueError, queueName, ...args));
        queue.on('paused', (...args) => container.client.emit(TaskEvents.QueuePaused, queueName, ...args));
        queue.on('progress', (...args) => container.client.emit(TaskEvents.QueueProgress, queueName, ...args));
        queue.on('removed', (...args) => container.client.emit(TaskEvents.QueueRemoved, queueName, ...args));
        queue.on('waiting', (...args) => container.client.emit(TaskEvents.QueueWaiting, queueName, ...args));

        return queue;
    }

    // @ts-expect-error When no queues are defined, the queue keys will be inferred as never which breaks the types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public _register(executor: TaskWorker<any>): this {
        this.executors.set(executor.queue, executor as unknown as TaskWorker<QueueName>);
        const worker = this.createWorker(executor.queue as QueueName, executor.workerOptions);
        this.workers.set(executor.queue, worker);

        return this;
    }

    // @ts-expect-error When no queues are defined, the queue keys will be inferred as never which breaks the types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async _unregister(handler: TaskWorker<any>): Promise<this> {
        const worker = this.workers.get(handler.queue);

        if (worker) {
            await worker.close();
            this.workers.delete(handler.queue);
        }

        this.executors.delete(handler.queue);

        return this;
    }

    public _unregisterAll(): Awaitable<this> {
        // @ts-expect-error When no queues are defined, the queue keys will be inferred as never which breaks the types
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return Promise.all([...this.executors.values()].map((executor) => this._unregister(executor as unknown as TaskWorker<any>))).then(() => this);
    }

    private async run(job: Job) {
        const executor = this.executors.get(job.queueName);

        if (!executor) {
            throw new Error(`No executor found for queue ${job.queueName}`);
        }

        const context = {
            logger: container.logger.child({
                type: 'task',
                queue: executor.queue,
                jobName: job.name,
                jobId: job.id,
            }),
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return executor.run(job as any, context);
    }

    public getQueue<QueueT extends QueueName>(
        queueName: QueueT,
        options?: Omit<QueueOptions, 'connection'>,
    ): Queue<Queues[QueueT]['_payload'], Queues[QueueT]['_response'], Queues[QueueT]['_jobName']> {
        let queue = this.queues.get(queueName);

        if (!queue) {
            queue = this.createQueue(queueName, options);
            this.queues.set(queueName, queue);
        }
        return queue as Queue<Queues[QueueT]['_payload'], Queues[QueueT]['_response'], Queues[QueueT]['_jobName']>;
    }

    public getWorker(queueName: QueueName): Worker | undefined {
        return this.workers.get(queueName);
    }

    public get flowProducer(): FlowProducer {
        if (!this._flowProducer) {
            this._flowProducer = new FlowProducer({
                connection: container.redis,
            });
        }

        return this._flowProducer;
    }

    public async close(): Promise<void> {
        await Promise.all([...this.workers.values()].map((worker) => worker.close()));
        await Promise.all([...this.queues.values()].map((queue) => queue.close()));
    }

    public async create<QueueT extends QueueName>(
        queueName: QueueT,
        jobName: Queues[QueueT]['_jobName'],
        data: Queues[QueueT]['_payload'],
        options?: JobsOptions,
    ) {
        const queue = this.getQueue(queueName);
        return queue.add(jobName, data, options);
    }

    /**
     * Setup repeating tasks
     *
     * This will add the initial jobs to the queue if they don't exist and **remove any jobs that are not in the initial jobs**
     */
    public async setupRepeating() {
        for (const [queueName, executor] of this.executors.entries()) {
            if (!executor.initialJobs || executor.initialJobs.length === 0) continue;

            const queue = this.getQueue(queueName as QueueName);

            const existingJobs = await queue.getRepeatableJobs();

            const initialJobs = Object.fromEntries(executor.initialJobs.map((job) => [this.getRepeatKey(job.name, job.repeat), job]));

            // if there are jobs in the queue that don't exist in the initial jobs, remove them
            for (const repeatingJob of existingJobs) {
                if (!initialJobs[repeatingJob.key]) {
                    await queue.removeRepeatableByKey(repeatingJob.key);
                }
            }

            for (const [key, job] of Object.entries(initialJobs)) {
                if (!existingJobs.find((repeatingJob) => repeatingJob.key === key)) {
                    await queue.add(job.name, job.data, {
                        repeat: job.repeat,
                        ...job.options,
                    });
                }
            }
        }
    }

    /**
     * Private method from bullmq to get the repeat key
     * @param name The name of the job
     * @param repeat The repeat options
     */
    private getRepeatKey(name: string, repeat: RepeatOptions) {
        const endDate = repeat.endDate ? new Date(repeat.endDate).getTime() : '';
        const tz = repeat.tz || '';
        const pattern = repeat.pattern;
        const suffix = (pattern ? pattern : String(repeat.every)) || '';
        const jobId = repeat.jobId ? repeat.jobId : '';

        return `${name}:${jobId}:${endDate}:${tz}:${suffix}`;
    }
}
