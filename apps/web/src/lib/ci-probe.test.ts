import { describe, expect, it } from 'vitest';

describe('sonde du CI', () => {
    it('échoue volontairement pour vérifier le blocage du merge', () => {
        expect(1).toBe(2);
    });
});
