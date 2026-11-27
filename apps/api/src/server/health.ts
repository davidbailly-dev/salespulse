import { Router } from 'express';

// GET /health : health check de Render et version déployée (jalon 011, D7). Il ne vérifie que le
// processus ; la base s'y ajoutera avec elle.
export function health(version: string): Router {
    const router = Router();
    router.get('/health', (_req, res) => {
        res.set('Cache-Control', 'no-store').json({ status: 'ok', version });
    });
    return router;
}
