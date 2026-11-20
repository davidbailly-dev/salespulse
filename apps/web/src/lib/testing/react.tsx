import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

/**
 * `QueryClient` isolé pour un test : sans nouvelle tentative, une réponse en erreur passe
 * aussitôt en `isError` au lieu de retenter avec délai.
 */
export function createTestQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });
}

/**
 * `wrapper` à passer à `render` ou `renderHook`. Un client neuf par appel par défaut : aucun cache
 * partagé entre tests. Passer un client explicite pour l'inspecter depuis le test.
 */
export function createQueryWrapper(client: QueryClient = createTestQueryClient()) {
    return function QueryWrapper({ children }: { children: ReactNode }) {
        return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    };
}
