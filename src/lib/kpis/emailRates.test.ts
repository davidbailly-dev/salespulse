import { describe, expect, it } from 'vitest';
import { buildEmailRow } from '../testing/builders';
import { calculateEmailRates } from './emailRates';

const NEWSLETTER = buildEmailRow({ campaign: 'newsletter', sent: 1000, opens: 250, clicks: 50 });
const CART_RECOVERY = buildEmailRow({ campaign: 'cart_recovery', sent: 200, opens: 100, clicks: 30 });

describe('calculateEmailRates', () => {
    it.each(['open', 'click'] as const)('renvoie une liste vide pour une liste vide (%s)', (metric) => {
        expect(calculateEmailRates([], metric)).toEqual([]);
    });

    it('calcule le taux d\'ouverture par campagne, du plus élevé au moins élevé', () => {
        expect(calculateEmailRates([NEWSLETTER, CART_RECOVERY], 'open')).toEqual([
            { campaign: 'cart_recovery', rate: 50 },
            { campaign: 'newsletter', rate: 25 },
        ]);
    });

    it('calcule le taux de clic rapporté aux envois, du plus élevé au moins élevé', () => {
        expect(calculateEmailRates([NEWSLETTER, CART_RECOVERY], 'click')).toEqual([
            { campaign: 'cart_recovery', rate: 15 },
            { campaign: 'newsletter', rate: 5 },
        ]);
    });

    // Σ ouvertures / Σ envois = 900 / 4000 = 22,5 %, et non la moyenne des taux des lignes
    // (30 % et 20 %) qui donnerait 25 %.
    it('cumule les lignes d\'une campagne avant de diviser', () => {
        const emails = [
            buildEmailRow({ campaign: 'newsletter', sent: 1000, opens: 300, clicks: 10 }),
            buildEmailRow({ campaign: 'newsletter', sent: 3000, opens: 600, clicks: 30 }),
        ];

        expect(calculateEmailRates(emails, 'open')).toEqual([{ campaign: 'newsletter', rate: 22.5 }]);
        expect(calculateEmailRates(emails, 'click')).toEqual([{ campaign: 'newsletter', rate: 1 }]);
    });

    it('arrondit à une décimale', () => {
        const oneThird = [buildEmailRow({ campaign: 'newsletter', sent: 3, opens: 1 })];
        const twoThirds = [buildEmailRow({ campaign: 'newsletter', sent: 3, opens: 2 })];

        expect(calculateEmailRates(oneThird, 'open')[0].rate).toBe(33.3);
        expect(calculateEmailRates(twoThirds, 'open')[0].rate).toBe(66.7);
    });

    it('exclut une campagne sans aucun envoi (pas de division par zéro)', () => {
        const emails = [NEWSLETTER, buildEmailRow({ campaign: 'cart_recovery', sent: 0, opens: 0, clicks: 0 })];

        expect(calculateEmailRates(emails, 'open')).toEqual([{ campaign: 'newsletter', rate: 25 }]);
    });
});
