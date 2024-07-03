import type { QueueListener, WorkerListener } from 'bullmq';

import type { QueueName } from './Queue.js';

export const TaskEvents = {
    /** @see {@link WorkerListener.active} */
    WorkerActive: 'taskWorkerActive' as const,
    /** @see {@link WorkerListener.closed} */
    WorkerClosed: 'taskWorkerClosed' as const,
    /** @see {@link WorkerListener.closing} */
    WorkerClosing: 'taskWorkerClosing' as const,
    /** @see {@link WorkerListener.completed} */
    WorkerCompleted: 'taskWorkerCompleted' as const,
    /** @see {@link WorkerListener.drained} */
    WorkerDrained: 'taskWorkerDrained' as const,
    /** @see {@link WorkerListener.error} */
    WorkerError: 'taskWorkerError' as const,
    /** @see {@link WorkerListener.failed} */
    WorkerFailed: 'taskWorkerFailed' as const,
    /** @see {@link WorkerListener.paused} */
    WorkerPaused: 'taskWorkerPaused' as const,
    /** @see {@link WorkerListener.progress} */
    WorkerProgress: 'taskWorkerProgress' as const,
    /** @see {@link WorkerListener.ready} */
    WorkerReady: 'taskWorkerReady' as const,
    /** @see {@link WorkerListener.resumed} */
    WorkerResumed: 'taskWorkerResumed' as const,
    /** @see {@link WorkerListener.stalled} */
    WorkerStalled: 'taskWorkerStalled' as const,

    // cleaned, error, paused, progress, removed, waiting
    /** @see {@link QueueListener.cleaned} */
    QueueCleaned: 'taskQueueCleaned' as const,
    /** @see {@link QueueListener.error} */
    QueueError: 'taskQueueError' as const,
    /** @see {@link QueueListener.paused} */
    QueuePaused: 'taskQueuePaused' as const,
    /** @see {@link QueueListener.progress} */
    QueueProgress: 'taskQueueProgress' as const,
    /** @see {@link QueueListener.removed} */
    QueueRemoved: 'taskQueueRemoved' as const,
    /** @see {@link QueueListener.waiting} */
    QueueWaiting: 'taskQueueWaiting' as const,
};

declare module 'discord.js' {
    interface ClientEvents {
        [TaskEvents.WorkerActive]: [queue: QueueName, ...args: Parameters<WorkerListener<unknown, unknown, string>['active']>];
        [TaskEvents.WorkerClosed]: [queue: QueueName, ...args: Parameters<WorkerListener<unknown, unknown, string>['closed']>];
        [TaskEvents.WorkerClosing]: [queue: QueueName, ...args: Parameters<WorkerListener<unknown, unknown, string>['closing']>];
        [TaskEvents.WorkerCompleted]: [queue: QueueName, ...args: Parameters<WorkerListener<unknown, unknown, string>['completed']>];
        [TaskEvents.WorkerDrained]: [queue: QueueName, ...args: Parameters<WorkerListener<unknown, unknown, string>['drained']>];
        [TaskEvents.WorkerError]: [queue: QueueName, ...args: Parameters<WorkerListener<unknown, unknown, string>['error']>];
        [TaskEvents.WorkerFailed]: [queue: QueueName, ...args: Parameters<WorkerListener<unknown, unknown, string>['failed']>];
        [TaskEvents.WorkerPaused]: [queue: QueueName, ...args: Parameters<WorkerListener<unknown, unknown, string>['paused']>];
        [TaskEvents.WorkerProgress]: [queue: QueueName, ...args: Parameters<WorkerListener<unknown, unknown, string>['progress']>];
        [TaskEvents.WorkerReady]: [queue: QueueName, ...args: Parameters<WorkerListener<unknown, unknown, string>['ready']>];
        [TaskEvents.WorkerResumed]: [queue: QueueName, ...args: Parameters<WorkerListener<unknown, unknown, string>['resumed']>];
        [TaskEvents.WorkerStalled]: [queue: QueueName, ...args: Parameters<WorkerListener<unknown, unknown, string>['stalled']>];

        [TaskEvents.QueueCleaned]: [queue: QueueName, ...args: Parameters<QueueListener<unknown, unknown, string>['cleaned']>];
        [TaskEvents.QueueError]: [queue: QueueName, ...args: Parameters<QueueListener<unknown, unknown, string>['error']>];
        [TaskEvents.QueuePaused]: [queue: QueueName, ...args: Parameters<QueueListener<unknown, unknown, string>['paused']>];
        [TaskEvents.QueueProgress]: [queue: QueueName, ...args: Parameters<QueueListener<unknown, unknown, string>['progress']>];
        [TaskEvents.QueueRemoved]: [queue: QueueName, ...args: Parameters<QueueListener<unknown, unknown, string>['removed']>];
        [TaskEvents.QueueWaiting]: [queue: QueueName, ...args: Parameters<QueueListener<unknown, unknown, string>['waiting']>];
    }
}
