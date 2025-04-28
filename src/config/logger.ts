import { ILogger } from "@wizeworks/graphql-factory-mongo";

export const logger: ILogger = {
    error: (message: string) => {
        const date = new Date();
        const formattedDate = date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
        console.error(`[${formattedDate}] ERROR: ${message}`);
    },
    warn: (message: string) => {
        const date = new Date();
        const formattedDate = date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
        console.warn(`[${formattedDate}] WARNING: ${message}`);
    },
    info: (message: string) => {
        const date = new Date();
        const formattedDate = date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
        console.info(`[${formattedDate}] INFO: ${message}`);
    },
    debug: (message: string) => {
        const date = new Date();
        const formattedDate = date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
        console.debug(`[${formattedDate}] DEBUG: ${message}`);
    },
};