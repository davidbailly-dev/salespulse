import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { captureLogs } from '../testing/logCapture';
import { createLogger } from './logger';
import { requestLogging } from './requestLogging';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function appWithRequestLogging() {
    const { destination, lines } = captureLogs();
    const app = express();
    app.use(requestLogging(createLogger('info', destination)));
    app.get('/orders', (_req, res) => {
        res.status(201).json({ ok: true });
    });
    return { app, lines };
}

describe('requestLogging', () => {
    it('écrit une ligne par requête : identifiant, méthode, chemin, statut et durée', async () => {
        const { app, lines } = appWithRequestLogging();

        await request(app).get('/orders');

        expect(lines).toHaveLength(1);
        expect(lines[0].req).toEqual({ id: expect.stringMatching(UUID), method: 'GET', path: '/orders' });
        expect(lines[0].res).toEqual({ statusCode: 201 });
        expect(lines[0].responseTime).toEqual(expect.any(Number));
    });

    it('journalise le chemin sans la query string, qui peut porter un jeton', async () => {
        const { app, lines } = appWithRequestLogging();

        await request(app).get('/orders?token=s3cr3t&page=2');

        expect((lines[0].req as { path: string }).path).toBe('/orders');
        expect(JSON.stringify(lines)).not.toContain('s3cr3t');
    });

    it('ne journalise aucun en-tête de requête ni de réponse', async () => {
        const { app, lines } = appWithRequestLogging();

        await request(app)
            .get('/orders')
            .set('Authorization', 'Bearer s3cr3t')
            .set('Cookie', 'session=s3cr3t')
            .set('X-Custom', 's3cr3t');

        expect(lines).toHaveLength(1);
        expect(JSON.stringify(lines)).not.toContain('s3cr3t');
        expect(JSON.stringify(lines)).not.toContain('content-type');
    });

    it('renvoie l’identifiant de la requête dans X-Request-Id, le même que dans le journal', async () => {
        const { app, lines } = appWithRequestLogging();

        const response = await request(app).get('/orders');

        expect(response.headers['x-request-id']).toMatch(UUID);
        expect((lines[0].req as { id: string }).id).toBe(response.headers['x-request-id']);
    });

    it('donne un identifiant différent à chaque requête', async () => {
        const { app } = appWithRequestLogging();

        const first = await request(app).get('/orders');
        const second = await request(app).get('/orders');

        expect(first.headers['x-request-id']).not.toBe(second.headers['x-request-id']);
    });

    it('ignore l’identifiant envoyé par le client, qui pourrait brouiller le journal', async () => {
        const { app, lines } = appWithRequestLogging();

        const response = await request(app).get('/orders').set('X-Request-Id', 'forged');

        expect(response.headers['x-request-id']).toMatch(UUID);
        expect((lines[0].req as { id: string }).id).toMatch(UUID);
    });
});
