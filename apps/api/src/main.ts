import { createServer } from 'node:http';
import { join } from 'node:path';

import next from 'next';

import { createApp } from './app';
import { ConfigError, loadConfig } from './server/config';
import { createLogger } from './server/logger';
import { readVersion } from './server/version';

// Point d'entrée du serveur unique (jalon 011, D1) : seul module à effets. Il branche la
// configuration, le logger et Next.js sur createApp, puis écoute le port. Gardé sans logique,
// hors des tests unitaires : le CI vérifie qu'il démarre (D10).

// Racine du dépôt, depuis apps/api/src.
const ROOT = join(__dirname, '..', '..', '..');
// Délai laissé aux requêtes en cours à l'arrêt, sous les 30 secondes que Render accorde avant de
// tuer le processus.
const SHUTDOWN_TIMEOUT_MS = 10_000;

async function main(): Promise<void> {
    const config = loadConfig(process.env);
    const logger = createLogger(config.logLevel);
    const version = readVersion(join(ROOT, 'package.json'));

    // Serveur créé avant Next.js, qui y branche lui-même les WebSockets du rechargement à chaud.
    const server = createServer();
    const nextApp = next({
        dev: config.nodeEnv === 'development',
        dir: join(ROOT, 'apps', 'web'),
        port: config.port,
        httpServer: server,
    });
    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    server.on('request', createApp({ version, logger, fallback: (req, res) => handle(req, res) }));
    await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.listen(config.port, resolve);
    });
    logger.info({ port: config.port, version, nodeEnv: config.nodeEnv }, 'serveur démarré');

    // Arrêt propre (D9) : plus de nouvelle connexion, les requêtes en cours se terminent.
    const shutdown = (signal: NodeJS.Signals) => {
        logger.info({ signal }, 'arrêt demandé');
        setTimeout(() => {
            logger.error('arrêt forcé : requêtes encore en cours');
            process.exit(1);
        }, SHUTDOWN_TIMEOUT_MS).unref();

        server.close((error) => {
            void nextApp.close().finally(() => {
                logger.info('serveur arrêté');
                process.exit(error ? 1 : 0);
            });
        });
    };
    process.once('SIGTERM', shutdown);
    process.once('SIGINT', shutdown);
}

main().catch((error: unknown) => {
    // Le logger configuré n'existe peut-être pas encore : journal au niveau par défaut.
    const logger = createLogger('info');
    if (error instanceof ConfigError) {
        logger.fatal({ variables: error.variables }, error.message);
    } else {
        logger.fatal({ err: error }, 'démarrage impossible');
    }
    process.exit(1);
});
