import { describe, expect, it } from 'vitest';

import { DomainError } from '../shared/domain/domainError';
import { errorCodeOf } from './errorCodeOf';

describe('errorCodeOf', () => {
    it('donne le code de la DomainError levée', () => {
        expect(
            errorCodeOf(() => {
                throw new DomainError('invalid-money', 'message');
            }),
        ).toBe('invalid-money');
    });

    it('donne not-a-domain-error pour une autre erreur', () => {
        expect(
            errorCodeOf(() => {
                throw new Error('message');
            }),
        ).toBe('not-a-domain-error');
    });

    it('donne undefined quand rien n’est levé', () => {
        expect(errorCodeOf(() => 42)).toBeUndefined();
    });

    it('refuse une action async, dont le rejet lui échapperait', () => {
        const action = async () => undefined;

        expect(() => errorCodeOf(action)).toThrow(/async/);
    });
});
