import type { i18n } from 'i18next';
import type { Logger } from 'pino';

declare module 'i18next' {
    interface CustomDefaultVariables {
        authorUsername: string;
        authorMention: string;
    }
}

export type CommonContext = {
    logger: Logger;
    i18n: i18n;
};
