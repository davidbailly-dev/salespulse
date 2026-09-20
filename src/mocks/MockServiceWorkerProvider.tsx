'use client';

import { useEffect, useState } from 'react';

/**
 * Démarre le Service Worker MSW côté navigateur avant d'afficher l'application,
 * pour que les tout premiers appels fetch des composants soient déjà interceptés.
 * Uniquement actif en développement : à retirer/adapter le jour où un vrai
 * backend est branché.
 */
export function MockServiceWorkerProvider({ children }: { children: React.ReactNode }) {
    const [isReady, setIsReady] = useState(process.env.NODE_ENV !== 'development');

    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') {
            return;
        }

        let isMounted = true;

        import('./browser').then(({ startWorker }) =>
            startWorker().then(() => {
                if (isMounted) {
                    setIsReady(true);
                }
            }),
        );

        return () => {
            isMounted = false;
        };
    }, []);

    if (!isReady) {
        return null;
    }

    return children;
}
