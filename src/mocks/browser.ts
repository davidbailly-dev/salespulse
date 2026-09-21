import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

let startPromise: ReturnType<typeof worker.start> | undefined;

/**
 * Le Strict Mode de React monte les composants deux fois en développement,
 * ce qui déclenche deux appels à `worker.start()` sur la même instance et fait
 * échouer MSW ("cannot configure an already enabled network"). On mémorise la
 * promesse de démarrage pour que les appels suivants la réutilisent au lieu de
 * redémarrer le worker.
 */
export function startWorker() {
    if (!startPromise) {
        startPromise = worker.start({ onUnhandledRequest: 'bypass' });
    }
    return startPromise;
}
