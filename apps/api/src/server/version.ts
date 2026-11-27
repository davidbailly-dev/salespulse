import { readFileSync } from 'node:fs';

import { z } from 'zod';

// Version du projet, lue une fois au démarrage dans le package.json racine et renvoyée par
// /health (jalon 011, D7). Format SemVer X.Y.Z, préversion admise, sans préfixe `v` : c'est
// celui qu'écrit `npm version`.
const packageJsonSchema = z.object({
    version: z.string().regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/),
});

export function parseVersion(packageJson: string): string {
    const result = packageJsonSchema.safeParse(JSON.parse(packageJson));
    if (!result.success) {
        throw new Error('package.json sans version au format X.Y.Z');
    }
    return result.data.version;
}

export function readVersion(path: string): string {
    const content = readFileSync(path, 'utf8');
    try {
        return parseVersion(content);
    } catch (error) {
        throw new Error(`${path} : ${error instanceof Error ? error.message : String(error)}`, {
            cause: error,
        });
    }
}
