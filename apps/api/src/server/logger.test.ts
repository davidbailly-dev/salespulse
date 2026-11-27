import { describe, expect, it } from 'vitest';

import { captureLogs } from '../testing/logCapture';
import { createLogger } from './logger';

describe('createLogger', () => {
    it('écrit une ligne JSON par appel, avec le message', () => {
        const { destination, lines } = captureLogs();

        createLogger('info', destination).info('démarré');

        expect(lines).toHaveLength(1);
        expect(lines[0].msg).toBe('démarré');
    });

    it('n’écrit pas sous le niveau configuré', () => {
        const { destination, lines } = captureLogs();
        const logger = createLogger('warn', destination);

        logger.info('ignoré');
        logger.warn('gardé');

        expect(lines.map((line) => line.msg)).toEqual(['gardé']);
    });

    it('n’écrit rien au niveau silent', () => {
        const { destination, lines } = captureLogs();

        createLogger('silent', destination).fatal('ignoré');

        expect(lines).toEqual([]);
    });

    it('masque les en-têtes authorization et cookie d’une requête journalisée', () => {
        const { destination, lines } = captureLogs();

        createLogger('info', destination).info({
            req: {
                headers: {
                    authorization: 'Bearer s3cr3t',
                    cookie: 'session=s3cr3t',
                    accept: 'application/json',
                },
            },
        });

        expect(lines[0].req).toEqual({
            headers: {
                authorization: '[Redacted]',
                cookie: '[Redacted]',
                accept: 'application/json',
            },
        });
        expect(JSON.stringify(lines)).not.toContain('s3cr3t');
    });
});
