import type { IncomingMessage, ServerResponse } from 'node:http';

import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { createApp } from './app';
import { createLogger } from './server/logger';
import { captureLogs } from './testing/logCapture';

// Repli qui répond comme le ferait Next.js, en recopiant l'URL reçue.
function fakeNext() {
    return vi.fn((req: IncomingMessage, res: ServerResponse) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`next:${req.method} ${req.url}`);
    });
}

function appWith(fallback?: (req: IncomingMessage, res: ServerResponse) => unknown) {
    const { destination, lines } = captureLogs();
    const app = createApp({ version: '1.4.0', logger: createLogger('info', destination), fallback });
    return { app, lines };
}

describe('createApp', () => {
    it('sert /health avec la version reçue, sans passer par le repli', async () => {
        const fallback = fakeNext();
        const { app } = appWith(fallback);

        const response = await request(app).get('/health');

        expect(response.body).toEqual({ status: 'ok', version: '1.4.0' });
        expect(fallback).not.toHaveBeenCalled();
    });

    it('n’annonce pas Express dans X-Powered-By', async () => {
        const { app } = appWith();

        const response = await request(app).get('/health');

        expect(response.headers['x-powered-by']).toBeUndefined();
    });

    it.each([
        ['GET', '/dashboard?preset=7d'],
        ['GET', '/api/orders?shop=elven-forge'],
        ['POST', '/api/analytics/traffic'],
    ])('délègue au repli %s %s, URL intacte', async (method, url) => {
        const fallback = fakeNext();
        const { app } = appWith(fallback);

        const response = await request(app)[method === 'GET' ? 'get' : 'post'](url);

        expect(response.status).toBe(200);
        expect(response.text).toBe(`next:${method} ${url}`);
    });

    it('pose X-Request-Id avant de passer la main au repli', async () => {
        const { app } = appWith(fakeNext());

        const response = await request(app).get('/dashboard');

        expect(response.headers['x-request-id']).toEqual(expect.any(String));
    });

    it('journalise aussi les requêtes servies par le repli', async () => {
        const { app, lines } = appWith(fakeNext());

        await request(app).get('/api/orders?shop=elven-forge');

        expect(lines).toHaveLength(1);
        expect(lines[0].req).toEqual(expect.objectContaining({ method: 'GET', path: '/api/orders' }));
    });

    it('répond 404 en JSON sans repli', async () => {
        const { app } = appWith();

        const response = await request(app).get('/api/orders');

        expect(response.status).toBe(404);
        expect(response.headers['content-type']).toMatch(/^application\/json/);
        expect(response.body).toEqual({ error: 'not-found' });
    });

    it('transforme l’échec du repli en 500 JSON, journalisé', async () => {
        const { app, lines } = appWith(async () => {
            throw new Error('Next.js a échoué');
        });

        const response = await request(app).get('/dashboard');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'internal-error' });
        expect(lines[0].err).toEqual(expect.objectContaining({ message: 'Next.js a échoué' }));
    });
});
