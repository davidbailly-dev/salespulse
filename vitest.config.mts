import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Logique métier pure : pas besoin de DOM (jsdom viendra éventuellement en phase 3).
        environment: 'node',
        include: ['src/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/lib/**'],
            exclude: [
                // Générateurs Faker aléatoires et hooks TanStack : ROI de test trop faible.
                'src/lib/mock-data/*Generator.ts',
                'src/lib/queries/**',
                'src/lib/query/**',
                'src/lib/testing/**',
                '**/*.test.ts',
            ],
        },
    },
});
