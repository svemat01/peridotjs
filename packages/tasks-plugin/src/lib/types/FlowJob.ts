import type { JobsOptions } from 'bullmq';

import type { QueueName, Queues } from './Queue.js';

export interface FlowJobBase<
    Options,
    Queue extends QueueName,
    DataType = Queues[Queue]['_payload'],
    NameType extends string = Queues[Queue]['_jobName'],
    Children extends FlowChildJob[] = FlowChildJob[],
> {
    name: NameType;
    queueName: Queue;
    data?: DataType;
    prefix?: string;
    opts?: Omit<Options, 'repeat'>;
    children?: Children;
}
export type FlowChildJob<Queue extends QueueName = QueueName, DataType = unknown, NameType extends string = string> = FlowJobBase<
    Omit<JobsOptions, 'parent'>,
    Queue,
    DataType,
    NameType
>;

export type FlowJob<Queue extends QueueName> = FlowJobBase<JobsOptions, Queue>;
