// eslint-disable-next-line @typescript-eslint/ban-types
export type QueueEntry<Payload, Response = null, JobName extends string = string & {}> = {
    _payload: Payload;
    _response: Response;
    _jobName: JobName;
};

export interface Queues {}

export type QueueName = keyof Queues;
