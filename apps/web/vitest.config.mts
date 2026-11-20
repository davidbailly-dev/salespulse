import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // L'environnement suit l'extension : `.ts` sans DOM (logique pure, routes API),
        // `.tsx` dans un DOM simulé (composants et hooks React).
        projects: [
            {
                extends: true,
                test: {
                    name: 'unit',
                    environment: 'node',
                    include: ['src/**/*.test.ts'],
                },
            },
            {
                extends: true,
                test: {
                    name: 'dom',
                    environment: 'jsdom',
                    include: ['src/**/*.test.tsx'],
                    setupFiles: ['src/lib/testing/setupDom.ts'],
                },
            },
        ],
        coverage: {
            provider: 'v8',
            include: ['src/lib/**', 'src/components/**'],
            exclude: [
                // Générateurs Faker : un seul appel exécute presque toutes leurs lignes, leur couverture
                // serait proche de 100 % sans rien prouver. Ils sont testés par invariants (schéma, seed).
                // [gG] : couvre aussi `generator.ts` (le motif est sensible à la casse).
                'src/lib/mock-data/*[gG]enerator.ts',
                'src/lib/testing/**',
                '**/*.test.ts',
                '**/*.test.tsx',
            ],
        },
    },
});
