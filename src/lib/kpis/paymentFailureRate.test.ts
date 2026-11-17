import { describe, expect, it } from 'vitest';
import { buildErrorRow, buildOrder } from '../testing/builders';
import { calculatePaymentFailureRate } from './paymentFailureRate';

const failures = (count: number) => buildErrorRow({ type: 'payment_failed', count });
const completedOrders = (count: number) =>
    Array.from({ length: count }, (_, i) => buildOrder({ id: `completed-${i}`, status: 'completed' }));

describe('calculatePaymentFailureRate', () => {
    it('renvoie 0 sans tentative de paiement', () => {
        expect(calculatePaymentFailureRate([], [])).toBe(0);
    });

    it('renvoie 0 sans échec', () => {
        expect(calculatePaymentFailureRate([], completedOrders(5))).toBe(0);
    });

    it('vaut 100 quand il n\'y a que des échecs', () => {
        expect(calculatePaymentFailureRate([failures(5)], [])).toBe(100);
    });

    it('rapporte les échecs aux tentatives (échecs + commandes completed)', () => {
        expect(calculatePaymentFailureRate([failures(1)], completedOrders(9))).toBe(10);
    });

    it('additionne les échecs de plusieurs lignes', () => {
        expect(calculatePaymentFailureRate([failures(2), failures(3)], completedOrders(5))).toBe(50);
    });

    // Un panier abandonné ou une commande remboursée n'est pas une tentative de paiement.
    it('ne compte pas les paniers abandonnés ni les remboursements comme des tentatives', () => {
        const orders = [
            ...completedOrders(1),
            ...Array.from({ length: 5 }, (_, i) => buildOrder({ id: `abandoned-${i}`, status: 'abandoned' })),
            ...Array.from({ length: 5 }, (_, i) => buildOrder({ id: `refunded-${i}`, status: 'refunded' })),
        ];

        expect(calculatePaymentFailureRate([failures(1)], orders)).toBe(50);
    });

    it('ignore les erreurs 404', () => {
        const errors = [failures(1), buildErrorRow({ type: 'not_found', count: 99 })];

        expect(calculatePaymentFailureRate(errors, completedOrders(1))).toBe(50);
    });

    it('arrondit à une décimale (1 / 3 = 33,3 %)', () => {
        expect(calculatePaymentFailureRate([failures(1)], completedOrders(2))).toBe(33.3);
    });
});
