import { describe, expect, it } from 'vitest';

import { errorCodeOf } from '../../testing/errorCodeOf';
import { countsInIndicators, ORDER_STATUSES, orderStatus } from './orderStatus';

describe('orderStatus', () => {
    it('liste les quatre statuts canoniques', () => {
        expect(ORDER_STATUSES).toEqual(['pending', 'paid', 'failed', 'cancelled']);
    });

    it('fige la liste des statuts, qu’aucun code ne peut modifier à l’exécution', () => {
        expect(Object.isFrozen(ORDER_STATUSES)).toBe(true);
    });

    it.each(['pending', 'paid', 'failed', 'cancelled'])('accepte « %s »', (value) => {
        expect(orderStatus(value)).toBe(value);
    });

    it.each([
        ['completed', 'statut de la démo'],
        ['abandoned', 'statut de la démo'],
        ['refunded', 'le remboursement n’est pas un statut'],
        ['processing', 'statut brut de WooCommerce'],
        ['PAID', 'casse différente'],
        [' paid', 'espace en tête'],
        ['', 'chaîne vide'],
    ])('refuse « %s » (%s)', (value) => {
        expect(errorCodeOf(() => orderStatus(value))).toBe('invalid-order-status');
    });
});

describe('countsInIndicators', () => {
    it('compte une commande payée', () => {
        expect(countsInIndicators(orderStatus('paid'))).toBe(true);
    });

    it.each(['pending', 'failed', 'cancelled'])('ne compte pas une commande « %s »', (value) => {
        expect(countsInIndicators(orderStatus(value))).toBe(false);
    });
});
