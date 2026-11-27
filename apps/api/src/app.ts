import type { IncomingMessage, ServerResponse } from 'node:http';

import express, { type Express } from 'express';
import type { Logger } from 'pino';

import { errorHandler } from './server/errorHandler';
import { health } from './server/health';
import { requestLogging } from './server/requestLogging';

export type AppDependencies = {
    readonly version: string;
    readonly logger: Logger;
    // Gestionnaire de toute requête qu'aucune route ne prend : Next.js dans le serveur unique.
    readonly fallback?: (req: IncomingMessage, res: ServerResponse) => unknown;
};

// Composition root du serveur (jalon 011, D1) : monte les middlewares et les routes, sans effet de
// bord ; main.ts lui fournit ses dépendances et écoute le port.
export function createApp({ version, logger, fallback }: AppDependencies): Express {
    const app = express();
    app.disable('x-powered-by');

    app.use(requestLogging(logger));
    app.use(health(version));

    // Sans partage de préfixe (D2) : une requête sous /api qu'Express ne prend pas va aussi au
    // repli. Express 5 transmet à errorHandler le rejet d'une promesse renvoyée.
    if (fallback) {
        app.use((req, res) => fallback(req, res));
    } else {
        app.use((_req, res) => {
            res.status(404).json({ error: 'not-found' });
        });
    }

    app.use(errorHandler);
    return app;
}
