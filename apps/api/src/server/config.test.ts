import { describe, expect, it } from 'vitest';

import { ConfigError, loadConfig } from './config';

// ConfigError levée par loadConfig(env) ; échoue si rien n'est levé ou si l'erreur est d'un
// autre type.
function configErrorOf(env: Record<string, string | undefined>): ConfigError {
    try {
        loadConfig(env);
    } catch (error) {
        if (error instanceof ConfigError) {
            return error;
        }
        throw error;
    }
    throw new Error('ConfigError attendue, rien n’a été levé');
}

describe('loadConfig', () => {
    it('applique les valeurs par défaut quand aucune variable n’est définie', () => {
        expect(loadConfig({})).toEqual({ port: 3000, nodeEnv: 'production', logLevel: 'info' });
    });

    it('démarre en production sans NODE_ENV : un oubli ne lance pas Next.js en développement', () => {
        expect(loadConfig({ PORT: '8080' }).nodeEnv).toBe('production');
    });

    it('lit PORT, NODE_ENV et LOG_LEVEL', () => {
        expect(loadConfig({ PORT: '8080', NODE_ENV: 'development', LOG_LEVEL: 'debug' })).toEqual({
            port: 8080,
            nodeEnv: 'development',
            logLevel: 'debug',
        });
    });

    it('accepte les ports 1 et 65535, bornes comprises', () => {
        expect(loadConfig({ PORT: '1' }).port).toBe(1);
        expect(loadConfig({ PORT: '65535' }).port).toBe(65535);
    });

    it.each(['development', 'production', 'test'])('accepte NODE_ENV %s', (nodeEnv) => {
        expect(loadConfig({ NODE_ENV: nodeEnv }).nodeEnv).toBe(nodeEnv);
    });

    it.each(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])(
        'accepte LOG_LEVEL %s',
        (logLevel) => {
            expect(loadConfig({ LOG_LEVEL: logLevel }).logLevel).toBe(logLevel);
        },
    );

    it('ignore les autres variables d’environnement', () => {
        expect(loadConfig({ HOME: '/home/app', DATABASE_URL: 'postgres://…' })).toEqual(
            loadConfig({}),
        );
    });

    it.each(['0', '65536', '-1', '3000.5', 'abc', '', ' 3000', '0x10', '3e3'])(
        'refuse PORT « %s »',
        (port) => {
            expect(configErrorOf({ PORT: port }).variables).toEqual(['PORT']);
        },
    );

    it.each(['staging', 'Production', ''])('refuse NODE_ENV « %s »', (nodeEnv) => {
        expect(configErrorOf({ NODE_ENV: nodeEnv }).variables).toEqual(['NODE_ENV']);
    });

    it.each(['verbose', 'INFO', ''])('refuse LOG_LEVEL « %s »', (logLevel) => {
        expect(configErrorOf({ LOG_LEVEL: logLevel }).variables).toEqual(['LOG_LEVEL']);
    });

    it('nomme toutes les variables invalides à la fois, dans le message comme dans la liste', () => {
        const error = configErrorOf({ PORT: 'abc', NODE_ENV: 'staging', LOG_LEVEL: 'verbose' });

        expect(error.variables).toEqual(['PORT', 'NODE_ENV', 'LOG_LEVEL']);
        expect(error.message).toContain('PORT');
        expect(error.message).toContain('NODE_ENV');
        expect(error.message).toContain('LOG_LEVEL');
    });

    it('ne recopie pas la valeur refusée, qui pourrait être un secret', () => {
        const error = configErrorOf({ PORT: 's3cr3t-port', LOG_LEVEL: 's3cr3t-level' });

        expect(error.message).not.toContain('s3cr3t');
        expect(JSON.stringify(error)).not.toContain('s3cr3t');
        expect(error.cause).toBeUndefined();
    });
});
