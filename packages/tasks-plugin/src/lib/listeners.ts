import { container } from '@peridotjs/framework';

import { TaskEvents } from './types/Events.js';

export const registerTaskEventListeners = () => {
    const { client } = container;
    const logger = container.logger.child({
        type: 'task',
    });

    client.on(TaskEvents.WorkerActive, (queue, job) => {
        logger.trace(
            {
                queue,
                jobName: job.name,
                jobId: job.id,
            },
            'Job entered active state',
        );
    });

    client.on(TaskEvents.WorkerClosed, (queue) => {
        logger.debug(
            {
                queue,
            },
            'Worker closed',
        );
    });

    client.on(TaskEvents.WorkerClosing, (queue, msg) => {
        logger.debug(
            {
                queue,
                msg,
            },
            'Worker closing',
        );
    });

    client.on(TaskEvents.WorkerCompleted, (queue, job) => {
        logger.trace(
            {
                queue,
                jobName: job.name,
                jobId: job.id,
            },
            'Job completed',
        );
    });

    client.on(TaskEvents.WorkerDrained, (queue) => {
        logger.debug(
            {
                queue,
            },
            'Worker drained',
        );
    });

    client.on(TaskEvents.WorkerError, (queue, error) => {
        logger.error(
            {
                queue,
                err: error,
            },
            'Worker error',
        );
    });

    client.on(TaskEvents.WorkerFailed, (queue, job, error) => {
        logger.error(
            {
                queue,
                jobName: job?.name,
                jobId: job?.id,
                err: error,
            },
            'Worker failed',
        );
    });

    client.on(TaskEvents.WorkerPaused, (queue) => {
        logger.debug(
            {
                queue,
            },
            'Worker paused',
        );
    });

    client.on(TaskEvents.WorkerProgress, (queue, job, progress) => {
        logger.trace(
            {
                queue,
                jobName: job.name,
                jobId: job.id,
                progress,
            },
            'Worker progress',
        );
    });

    client.on(TaskEvents.WorkerReady, (queue) => {
        logger.debug(
            {
                queue,
            },
            'Worker ready',
        );
    });

    client.on(TaskEvents.WorkerResumed, (queue) => {
        logger.debug(
            {
                queue,
            },
            'Worker resumed',
        );
    });

    client.on(TaskEvents.WorkerStalled, (queue, jobId) => {
        logger.trace(
            {
                queue,
                jobId,
            },
            'Worker stalled',
        );
    });

    client.on(TaskEvents.QueueCleaned, (queue, jobIds, type) => {
        logger.debug(
            {
                queue,
                jobIds,
                type,
            },
            'Queue cleaned',
        );
    });

    client.on(TaskEvents.QueueError, (queue, err) => {
        logger.error(
            {
                queue,
                err,
            },
            'Queue error',
        );
    });

    client.on(TaskEvents.QueuePaused, (queue) => {
        logger.debug(
            {
                queue,
            },
            'Queue paused',
        );
    });

    client.on(TaskEvents.QueueProgress, (queue, job, progress) => {
        logger.trace(
            {
                queue,
                jobName: job.name,
                jobId: job.id,
                progress,
            },
            'Queue progress',
        );
    });

    client.on(TaskEvents.QueueRemoved, (queue, jobId) => {
        logger.trace(
            {
                queue,
                jobId,
            },
            'Queue removed',
        );
    });

    client.on(TaskEvents.QueueWaiting, (queue, jobId) => {
        logger.trace(
            {
                queue,
                jobId,
            },
            'Queue waiting',
        );
    });
};
