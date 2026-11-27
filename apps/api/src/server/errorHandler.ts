import type { ErrorRequestHandler } from 'express';

// Dernier middleware : une erreur non gérée donne un 500 JSON générique, sans message ni pile
// d'appels, qui pourraient révéler l'implémentation. L'erreur complète passe par `res.err` sur
// la ligne de journal de la requête (requestLogging.ts), reliée par X-Request-Id.
export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
    res.err = error instanceof Error ? error : new Error(String(error));

    // Réponse déjà commencée : seul Express sait l'interrompre (il ferme la connexion) ; l'erreur
    // reste journalisée par `res.err`.
    if (res.headersSent) {
        next(error);
        return;
    }

    res.status(500).json({ error: 'internal-error' });
};
