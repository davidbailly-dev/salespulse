import { z } from 'zod';

// Configuration du serveur, lue dans les variables d'environnement et validée au démarrage
// (jalon 011, D6).

const NODE_ENVS = ['development', 'production', 'test'] as const;
// Niveaux de pino, du plus grave au plus bavard ; `silent` coupe les journaux.
const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;

export type Config = {
    readonly port: number;
    readonly nodeEnv: (typeof NODE_ENVS)[number];
    readonly logLevel: (typeof LOG_LEVELS)[number];
};

// Chiffres seulement : `Number()` accepterait aussi « 0x10 », « 3e3 » ou « 3000 » entouré
// d'espaces.
const portSchema = z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(65535));

// Une variable vide est refusée, pas remplacée par sa valeur par défaut : une affectation
// oubliée (`PORT=`) se voit au démarrage. NODE_ENV vaut production par défaut (jalon 011, D13) :
// une commande de démarrage qui l'oublie ne lance pas Next.js en mode développement.
const envSchema = z.object({
    PORT: portSchema.default(3000),
    NODE_ENV: z.enum(NODE_ENVS).default('production'),
    LOG_LEVEL: z.enum(LOG_LEVELS).default('info'),
});

type Variable = keyof typeof envSchema.shape;

// Valeurs attendues, citées dans le message à la place des messages de Zod, pour ne jamais y
// recopier la valeur reçue.
const EXPECTED: Record<Variable, string> = {
    PORT: 'entier de 1 à 65535',
    NODE_ENV: NODE_ENVS.join(', '),
    LOG_LEVEL: LOG_LEVELS.join(', '),
};

const VARIABLES = Object.keys(EXPECTED) as Variable[];

// Configuration invalide : nomme chaque variable refusée et ce qu'elle attend, jamais sa valeur,
// qui pourra être un secret.
export class ConfigError extends Error {
    readonly variables: readonly string[];

    constructor(variables: readonly Variable[]) {
        super(
            `Variables d'environnement invalides : ${variables
                .map((variable) => `${variable} (${EXPECTED[variable]})`)
                .join(' ; ')}`,
        );
        this.name = 'ConfigError';
        this.variables = variables;
    }
}

export function loadConfig(env: Readonly<Record<string, string | undefined>>): Config {
    const result = envSchema.safeParse(env);
    if (!result.success) {
        const invalid = new Set(result.error.issues.map((issue) => issue.path[0]));
        throw new ConfigError(VARIABLES.filter((variable) => invalid.has(variable)));
    }

    return {
        port: result.data.PORT,
        nodeEnv: result.data.NODE_ENV,
        logLevel: result.data.LOG_LEVEL,
    };
}
