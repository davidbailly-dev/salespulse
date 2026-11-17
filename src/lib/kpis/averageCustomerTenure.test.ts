import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildCustomer } from '../testing/builders';
import { calculateAverageCustomerTenureDays } from './averageCustomerTenure';

const NOW = new Date('2026-01-31T00:00:00.000Z');

describe('calculateAverageCustomerTenureDays', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(calculateAverageCustomerTenureDays([], NOW)).toBe(0);
    });

    it('calcule l\'ancienneté d\'un client en jours', () => {
        const customers = [buildCustomer({ registeredAt: '2026-01-21T00:00:00.000Z' })];

        expect(calculateAverageCustomerTenureDays(customers, NOW)).toBe(10);
    });

    it('fait la moyenne des anciennetés', () => {
        const customers = [
            buildCustomer({ id: 'c1', registeredAt: '2026-01-21T00:00:00.000Z' }), // 10 jours
            buildCustomer({ id: 'c2', registeredAt: '2026-01-11T00:00:00.000Z' }), // 20 jours
        ];

        expect(calculateAverageCustomerTenureDays(customers, NOW)).toBe(15);
    });

    it('arrondit à l\'entier (10,5 jours -> 11)', () => {
        const customers = [
            buildCustomer({ id: 'c1', registeredAt: '2026-01-21T00:00:00.000Z' }), // 10 jours
            buildCustomer({ id: 'c2', registeredAt: '2026-01-20T00:00:00.000Z' }), // 11 jours
        ];

        expect(calculateAverageCustomerTenureDays(customers, NOW)).toBe(11);
    });

    it('tient compte des jours partiels', () => {
        // 1,5 jour d'ancienneté -> arrondi à 2.
        const customers = [buildCustomer({ registeredAt: '2026-01-29T12:00:00.000Z' })];

        expect(calculateAverageCustomerTenureDays(customers, NOW)).toBe(2);
    });

    describe('instant courant par défaut', () => {
        afterEach(() => {
            vi.useRealTimers();
        });

        it('utilise l\'horloge système quand `now` est omis', () => {
            vi.useFakeTimers();
            vi.setSystemTime(NOW);
            const customers = [buildCustomer({ registeredAt: '2026-01-21T00:00:00.000Z' })];

            expect(calculateAverageCustomerTenureDays(customers)).toBe(10);
        });
    });
});
