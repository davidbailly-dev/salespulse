import type { Server } from 'node:http';
import type { Duplex } from 'node:stream';

import type { Logger } from 'pino';

export type ShutdownDependencies = {
    readonly server: Server;
    readonly logger: Logger;
    // Dernière étape avant la sortie : la fermeture de Next.js dans le serveur unique.
    readonly beforeExit: () => Promise<void>;
    readonly exit: (code: number) => void;
    // Délai laissé aux requêtes en cours, au-delà duquel la sortie est forcée avec le code 1.
    readonly timeoutMs: number;
};

// Arrêt propre du serveur (jalon 011, D9) : plus de nouvelle connexion, les requêtes en cours se
// terminent, puis beforeExit et la sortie. Renvoie le gestionnaire à brancher sur SIGTERM et
// SIGINT ; à créer dès le démarrage, pour suivre les WebSocket ouvertes.
export function createShutdown({
    server,
    logger,
    beforeExit,
    exit,
    timeoutMs,
}: ShutdownDependencies): (signal: NodeJS.Signals) => void {
    // Une connexion passée en WebSocket (rechargement à chaud de Next.js) n'est plus une requête
    // HTTP : server.close() l'attendrait indéfiniment. Elles sont donc suivies pour être fermées.
    // Le suivi ne répond pas à l'upgrade : c'est le rôle de Next.js, qui écoute le même événement.
    const upgradedSockets = new Set<Duplex>();
    server.on('upgrade', (_req, socket: Duplex) => {
        upgradedSockets.add(socket);
        socket.once('close', () => upgradedSockets.delete(socket));
    });

    let stopping = false;

    return (signal) => {
        // Un Ctrl+C arrive plusieurs fois (terminal, puis relais de npm) : les signaux suivants
        // sont ignorés, au lieu de tuer le processus au milieu de l'arrêt.
        if (stopping) {
            logger.info({ signal }, 'arrêt déjà en cours');
            return;
        }
        stopping = true;
        logger.info({ signal }, 'arrêt demandé');

        const forcedExit = setTimeout(() => {
            logger.error('arrêt forcé : requêtes encore en cours');
            exit(1);
        }, timeoutMs);
        forcedExit.unref();

        // server.close() ne ferme les connexions inactives qu'à son appel : une connexion
        // keep-alive dont la requête se termine ensuite le retiendrait jusqu'à son propre délai.
        const idleSweep = setInterval(() => server.closeIdleConnections(), 100);
        idleSweep.unref();

        server.close((closeError) => {
            clearInterval(idleSweep);
            beforeExit()
                .then(
                    () => (closeError ? 1 : 0),
                    (error: unknown) => {
                        logger.error({ err: error }, 'échec de la fermeture');
                        return 1;
                    },
                )
                .then((code) => {
                    clearTimeout(forcedExit);
                    logger.info('serveur arrêté');
                    exit(code);
                });
        });

        for (const socket of upgradedSockets) {
            socket.destroy();
        }
    };
}
