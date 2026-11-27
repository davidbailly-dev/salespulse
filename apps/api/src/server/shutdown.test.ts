import { createServer, request, type RequestListener, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { captureLogs } from '../testing/logCapture';
import { createLogger } from './logger';
import { createShutdown } from './shutdown';

let server: Server;

afterEach(() => {
    server.closeAllConnections();
    server.close();
});

async function listen(handler: RequestListener): Promise<string> {
    server = createServer(handler);
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

// Attend qu'une connexion de client soit ouverte sur le serveur.
async function waitForConnection(): Promise<void> {
    await vi.waitFor(async () => {
        const count = await new Promise<number>((resolve, reject) =>
            server.getConnections((error, n) => (error ? reject(error) : resolve(n))),
        );
        expect(count).toBeGreaterThan(0);
    });
}

// Faux process.exit : `exited` se résout avec le code reçu, `codes` les garde tous.
function fakeExit() {
    const codes: number[] = [];
    let resolve: (code: number) => void = () => undefined;
    const exited = new Promise<number>((r) => {
        resolve = r;
    });
    return {
        codes,
        exited,
        exit: (code: number) => {
            codes.push(code);
            resolve(code);
        },
    };
}

function shutdownWith(options: { timeoutMs?: number; beforeExit?: () => Promise<void> } = {}) {
    const { destination, lines } = captureLogs();
    const { exit, exited, codes } = fakeExit();
    const beforeExit = vi.fn(options.beforeExit ?? (async () => undefined));
    const shutdown = createShutdown({
        server,
        logger: createLogger('info', destination),
        beforeExit,
        exit,
        timeoutMs: options.timeoutMs ?? 2000,
    });
    return { shutdown, exited, codes, beforeExit, lines };
}

describe('createShutdown', () => {
    it('ferme le serveur, appelle beforeExit puis sort avec le code 0', async () => {
        await listen((_req, res) => res.end('ok'));
        const { shutdown, exited, beforeExit, lines } = shutdownWith();

        shutdown('SIGTERM');

        expect(await exited).toBe(0);
        expect(server.listening).toBe(false);
        expect(beforeExit).toHaveBeenCalledOnce();
        expect(lines.map((line) => line.msg)).toEqual(['arrêt demandé', 'serveur arrêté']);
    });

    it('laisse finir une requête en cours avant de sortir', async () => {
        const events: string[] = [];
        const url = await listen((_req, res) => {
            setTimeout(() => {
                events.push('réponse');
                res.end('ok');
            }, 100);
        });
        const { shutdown, exited } = shutdownWith();

        const response = fetch(url);
        await waitForConnection();
        shutdown('SIGTERM');
        void exited.then(() => events.push('sortie'));

        expect((await response).status).toBe(200);
        expect(await exited).toBe(0);
        expect(events).toEqual(['réponse', 'sortie']);
    });

    it('ignore un signal reçu pendant l’arrêt : une seule fermeture, une seule sortie', async () => {
        await listen((_req, res) => res.end('ok'));
        const { shutdown, exited, codes, beforeExit } = shutdownWith();

        shutdown('SIGINT');
        shutdown('SIGINT');
        shutdown('SIGTERM');

        expect(await exited).toBe(0);
        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(codes).toEqual([0]);
        expect(beforeExit).toHaveBeenCalledOnce();
    });

    it('ferme les WebSocket ouvertes, qui bloqueraient la fermeture du serveur', async () => {
        const url = await listen((_req, res) => res.end('ok'));
        // Accepte l'upgrade et garde la connexion, comme le rechargement à chaud de Next.js.
        server.on('upgrade', (_req, socket) => {
            socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n\r\n');
        });
        const { shutdown, exited } = shutdownWith({ timeoutMs: 1000 });
        const clientClosed = new Promise<void>((resolve) => {
            const req = request(`${url}/_next/hmr`, {
                headers: { Connection: 'Upgrade', Upgrade: 'websocket' },
            });
            req.on('upgrade', (_res, socket) => {
                socket.on('close', () => resolve());
                shutdown('SIGTERM');
            });
            req.end();
        });

        await clientClosed;
        expect(await exited).toBe(0);
    });

    it('force la sortie avec le code 1 quand une requête dépasse le délai', async () => {
        const url = await listen(() => undefined);
        const { shutdown, exited, lines } = shutdownWith({ timeoutMs: 50 });

        void fetch(url).catch(() => undefined);
        await waitForConnection();
        shutdown('SIGTERM');

        expect(await exited).toBe(1);
        expect(lines.some((line) => line.level === 50 && line.msg === 'arrêt forcé : requêtes encore en cours')).toBe(true);
    });

    it('sort avec le code 1, erreur journalisée, quand beforeExit échoue', async () => {
        await listen((_req, res) => res.end('ok'));
        const { shutdown, exited, lines } = shutdownWith({
            beforeExit: async () => {
                throw new Error('Next.js ne se ferme pas');
            },
        });

        shutdown('SIGTERM');

        expect(await exited).toBe(1);
        expect(lines.find((line) => line.level === 50)?.err).toEqual(
            expect.objectContaining({ message: 'Next.js ne se ferme pas' }),
        );
    });
});
