import { randomUUID } from 'node:crypto';

import type { RequestHandler } from 'express';
import type { Logger } from 'pino';
import { pinoHttp } from 'pino-http';

// Une ligne de journal par requête, écrite à la fin de la réponse (jalon 011, D5) : identifiant,
// méthode, chemin, statut et durée. Ni query string, qui portera des jetons, ni en-têtes, qui
// portent les cookies de session.
export function requestLogging(logger: Logger): RequestHandler {
    return pinoHttp({
        logger,
        // Identifiant toujours généré : celui qu'enverrait le client n'est pas repris, pour qu'il
        // ne puisse pas se faire passer pour une autre requête dans le journal. Renvoyé dans
        // X-Request-Id, posé avant toute réponse, pour relier une erreur signalée à sa ligne.
        genReqId: (_req, res) => {
            const id = randomUUID();
            res.setHeader('X-Request-Id', id);
            return id;
        },
        // pino-http écrit au niveau info même une requête en erreur : sans cette règle, un
        // LOG_LEVEL=error masquerait les 500.
        customLogLevel: (_req, res, error) =>
            error || res.err || res.statusCode >= 500 ? 'error' : 'info',
        serializers: {
            req: (req: { id: string; method: string; url: string }) => ({
                id: req.id,
                method: req.method,
                path: req.url.split('?')[0],
            }),
            res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
        },
    });
}
