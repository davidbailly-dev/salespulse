import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { captureLogs } from '../testing/logCapture';
import { errorHandler } from './errorHandler';
import { createLogger } from './logger';
import { requestLogging } from './requestLogging';

function appThatFails(failure: () => unknown) {
    const { destination, lines } = captureLogs();
    const app = express();
    app.use(requestLogging(createLogger('info', destination)));
    app.get('/fails', async () => {
        await failure();
    });
    app.use(errorHandler);
    return { app, lines };
}

describe('errorHandler', () => {
    it('répond 500 en JSON, sans message interne ni pile d’appels', async () => {
        const { app } = appThatFails(() => {
            throw new Error('détail interne s3cr3t');
        });

        const response = await request(app).get('/fails');

        expect(response.status).toBe(500);
        expect(response.headers['content-type']).toMatch(/^application\/json/);
        expect(response.body).toEqual({ error: 'internal-error' });
        expect(response.text).not.toContain('s3cr3t');
        expect(response.text).not.toContain('errorHandler.test');
    });

    it('écrit l’erreur, message et pile compris, sur la ligne de journal de la requête', async () => {
        const { app, lines } = appThatFails(() => {
            throw new Error('détail interne s3cr3t');
        });

        const response = await request(app).get('/fails');

        expect(lines).toHaveLength(1);
        expect(lines[0].level).toBe(50);
        expect(lines[0].req).toEqual(expect.objectContaining({ id: response.headers['x-request-id'] }));
        expect(lines[0].err).toEqual(
            expect.objectContaining({
                message: 'détail interne s3cr3t',
                stack: expect.stringContaining('errorHandler.test'),
            }),
        );
    });

    it('journalise aussi l’erreur d’une réponse déjà commencée, sans y ajouter de JSON', async () => {
        const { destination, lines } = captureLogs();
        const app = express();
        app.use(requestLogging(createLogger('info', destination)));
        app.get('/partial', (_req, res) => {
            res.status(200).write('début');
            throw new Error('échec en cours de réponse');
        });
        app.use(errorHandler);

        // Express interrompt la connexion : le client reçoit un début de réponse ou une erreur.
        const received = await request(app)
            .get('/partial')
            .then(
                (response) => response.text,
                (error: Error) => error.message,
            );

        expect(received).not.toContain('internal-error');
        await vi.waitFor(() => expect(lines).toHaveLength(1));
        expect(lines[0].level).toBe(50);
        expect(lines[0].err).toEqual(
            expect.objectContaining({ message: 'échec en cours de réponse' }),
        );
    });

    it('traite de même une valeur levée qui n’est pas une Error', async () => {
        const { app, lines } = appThatFails(() => {
            throw 'chaîne levée';
        });

        const response = await request(app).get('/fails');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'internal-error' });
        expect(JSON.stringify(lines[0].err)).toContain('chaîne levée');
    });
});
