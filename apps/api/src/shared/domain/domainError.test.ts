import { describe, expect, it } from 'vitest';

import { DomainError } from './domainError';

describe('DomainError', () => {
    it('porte son code et son message, et reste une Error', () => {
        const error = new DomainError('invalid-money', 'Montant invalide');

        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe('DomainError');
        expect(error.code).toBe('invalid-money');
        expect(error.message).toBe('Montant invalide');
    });
});
