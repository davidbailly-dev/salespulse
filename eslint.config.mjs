import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// Config unique à la racine : `eslint .` lint tous les paquets du monorepo.
const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    {
        // Les règles Next cherchent `app/` à partir de la racine de l'application.
        settings: { next: { rootDir: 'apps/web' } },
    },
    globalIgnores(['**/.next/**', '**/out/**', '**/build/**', '**/next-env.d.ts', '**/public/mockServiceWorker.js', '**/coverage/**']),
]);

export default eslintConfig;
