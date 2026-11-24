import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// Architecture hexagonale d'apps/api (jalon 010, D3 et D21) : les chemins d'import autorisés
// dépendent de la couche du fichier. Les tests en sont exemptés (vitest, adapters en mémoire).
const API_TESTS = ['apps/api/**/*.test.ts'];
const restrictImports = (regex, message) => ({
    'no-restricted-imports': ['error', { patterns: [{ regex, message }] }],
});
const apiLayers = [
    {
        // domain/ et shared/domain/ : leur dossier et le shared kernel, rien d'autre.
        files: ['apps/api/src/*/domain/**/*.ts'],
        ignores: API_TESTS,
        rules: restrictImports(
            '^(?!\\./|(\\.\\./)+shared/domain(/|$))',
            'domain/ n\'importe que son dossier et shared/domain/ : ni application/, ni '
                + 'infrastructure/, ni autre contexte, ni paquet externe (D3).',
        ),
    },
    {
        // application/ : son dossier, son domaine, le shared kernel, l'index d'un contexte.
        files: ['apps/api/src/*/application/**/*.ts'],
        ignores: API_TESTS,
        rules: restrictImports(
            '^(?!\\./|\\.\\./domain(/|$)|\\.\\./\\.\\./shared/domain(/|$)|\\.\\./\\.\\./[a-z-]+(/index)?$)',
            'application/ n\'importe ni infrastructure/, ni paquet externe, ni l\'intérieur '
                + 'd\'un autre contexte, seulement son index.ts (D3).',
        ),
    },
    {
        // infrastructure/ : tout, sauf l'intérieur d'un autre contexte.
        files: ['apps/api/src/*/infrastructure/**/*.ts'],
        ignores: API_TESTS,
        rules: restrictImports(
            '^\\.\\./\\.\\./(?!shared/domain(/|$))[a-z-]+/',
            'Un autre contexte ne s\'importe que par son index.ts (D3).',
        ),
    },
];

// Config unique à la racine : `eslint .` lint tous les paquets du monorepo.
const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    {
        // Les règles Next cherchent `app/` à partir de la racine de l'application.
        settings: { next: { rootDir: 'apps/web' } },
    },
    ...apiLayers,
    globalIgnores(['**/.next/**', '**/out/**', '**/build/**', '**/next-env.d.ts', '**/public/mockServiceWorker.js', '**/coverage/**']),
]);

export default eslintConfig;
