import type { CommonContext } from '@peridotjs/framework';
import type { Job, JobsOptions, RepeatOptions, WorkerOptions } from 'bullmq';

import type { QueueEntry, QueueName, Queues } from './Queue.js';

export type TaskWorkerContext = CommonContext;

export type TaskWorker<
    Queue extends QueueName,
    Context extends TaskWorkerContext = TaskWorkerContext,
    InitialJobs extends TaskWorkerInitialJob<Queue, Queues[Queue]['_jobName']>[] = TaskWorkerInitialJob<Queue, Queues[Queue]['_jobName']>[],
> = {
    queue: Queue;
    workerOptions?: Omit<WorkerOptions, 'connection'>;
    run: TaskWorkerRun<Queue, Context>;

    /**
     * Initial jobs to be added to the queue when the worker is started, this is useful for repeating tasks
     */
    initialJobs?: InitialJobs;
};

export type TaskWorkerInitialJob<Queue extends QueueName, JobName extends Queues[Queue]['_jobName']> = {
    name: JobName;
    data: QueueFromJobName<Queue, JobName>['_payload'];
    repeat: RepeatOptions;
    options?: Omit<JobsOptions, 'repeat'>;
};

export type QueueFromJobName<Queue extends QueueName, JobName extends Queues[Queue]['_jobName']> = Queues[Queue] extends infer U
    ? U extends QueueEntry<infer P, infer R, infer J>
        ? J extends JobName
            ? QueueEntry<P, R, J>
            : never
        : never
    : never;

export type TaskWorkerRun<Queue extends QueueName, Context extends TaskWorkerContext = TaskWorkerContext> = (
    job: Job<Queues[Queue]['_payload'], Queues[Queue]['_response']>,
    ctx: Context,
) => Promise<Queues[Queue]['_response']>;
