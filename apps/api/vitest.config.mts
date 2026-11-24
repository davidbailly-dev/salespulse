import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts'],
        // Le paquet n'a pas encore de test : retiré avec le premier value object (phase C).
        passWithNoTests: true,
        coverage: {
            provider: 'v8',
            include: ['src/**'],
            exclude: ['**/*.test.ts'],
        },
    },
});
