import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { health } from './health';

function appWithHealth(version: string) {
    const app = express();
    app.use(health(version));
    return app;
}

describe('health', () => {
    it('GET /health répond 200 avec le statut et la version', async () => {
        const response = await request(appWithHealth('1.4.0')).get('/health');

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/^application\/json/);
        expect(response.body).toEqual({ status: 'ok', version: '1.4.0' });
    });

    it('interdit la mise en cache, pour qu’une nouvelle version se voie tout de suite', async () => {
        const response = await request(appWithHealth('1.4.0')).get('/health');

        expect(response.headers['cache-control']).toBe('no-store');
    });

    it('ne prend que GET et HEAD sur /health', async () => {
        const app = appWithHealth('1.4.0');

        expect((await request(app).head('/health')).status).toBe(200);
        expect((await request(app).post('/health')).status).toBe(404);
        expect((await request(app).get('/health/details')).status).toBe(404);
    });
});
