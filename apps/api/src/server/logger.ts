import { pino, type DestinationStream, type Logger } from 'pino';

import type { Config } from './config';

// Logger JSON du serveur, écrit sur la sortie standard que lit Render (jalon 011, D5). Le
// masquage est un filet de sécurité : la ligne par requête ne journalise déjà aucun en-tête
// (requestLogging.ts), mais un `logger.info({ req })` écrit ailleurs les recopierait.
export function createLogger(level: Config['logLevel'], destination?: DestinationStream): Logger {
    const options = {
        level,
        redact: ['req.headers.authorization', 'req.headers.cookie'],
    };
    return destination ? pino(options, destination) : pino(options);
}
