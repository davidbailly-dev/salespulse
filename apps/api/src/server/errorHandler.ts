import type { ErrorRequestHandler } from 'express';

// Dernier middleware : une erreur non gérée donne un 500 JSON générique, sans message ni pile
// d'appels, qui pourraient révéler l'implémentation. L'erreur complète passe par `res.err` sur
// la ligne de journal de la requête (requestLogging.ts), reliée par X-Request-Id.
// Les quatre paramètres sont requis : Express reconnaît un gestionnaire d'erreurs à son arité.
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- `_next`, requis pour l'arité
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    res.err = error instanceof Error ? error : new Error(String(error));

    // Réponse déjà commencée : la connexion est fermée ici plutôt que par Express, qui écrirait
    // aussi la pile en texte sur stderr, hors des journaux JSON. L'erreur reste journalisée par
    // `res.err`.
    if (res.headersSent) {
        res.destroy();
        return;
    }

    res.status(500).json({ error: 'internal-error' });
};
