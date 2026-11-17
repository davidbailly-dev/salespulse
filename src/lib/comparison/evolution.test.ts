import { describe, expect, it } from 'vitest';
import { calculateEvolution, NEGLIGIBLE_POINTS_CHANGE, NEGLIGIBLE_RELATIVE_CHANGE } from './evolution';

describe('calculateEvolution', () => {
    describe('mode relatif (par défaut)', () => {
        it('est le mode utilisé quand aucun mode n\'est précisé', () => {
            expect(calculateEvolution(110, 100, 'higher-is-better')).toEqual(
                calculateEvolution(110, 100, 'higher-is-better', 'relative'),
            );
        });

        it('calcule une hausse en pourcentage de la valeur précédente', () => {
            expect(calculateEvolution(110, 100, 'higher-is-better')).toEqual({
                change: 10,
                direction: 'up',
                tone: 'good',
            });
        });

        it('calcule une baisse en pourcentage de la valeur précédente', () => {
            expect(calculateEvolution(90, 100, 'higher-is-better')).toEqual({
                change: -10,
                direction: 'down',
                tone: 'bad',
            });
        });

        it('peut dépasser 100 % de hausse', () => {
            expect(calculateEvolution(300, 100, 'higher-is-better')?.change).toBe(200);
        });

        it('vaut -100 % quand la valeur courante tombe à zéro', () => {
            expect(calculateEvolution(0, 100, 'higher-is-better')).toEqual({
                change: -100,
                direction: 'down',
                tone: 'bad',
            });
        });

        describe('valeur précédente nulle', () => {
            it('renvoie null (division par zéro) quand la valeur courante est positive', () => {
                expect(calculateEvolution(50, 0, 'higher-is-better')).toBeNull();
            });

            it('renvoie null aussi quand les deux valeurs sont nulles', () => {
                expect(calculateEvolution(0, 0, 'higher-is-better')).toBeNull();
            });

            it('renvoie null quelle que soit la polarité', () => {
                expect(calculateEvolution(50, 0, 'lower-is-better')).toBeNull();
                expect(calculateEvolution(50, 0, 'neutral')).toBeNull();
            });
        });

        describe('valeur précédente négative', () => {
            // On divise par |previous| : sans cela, passer de -100 à -50 (une amélioration)
            // s'afficherait comme une baisse.
            it('compte comme une hausse le passage de -100 à -50', () => {
                expect(calculateEvolution(-50, -100, 'higher-is-better')).toEqual({
                    change: 50,
                    direction: 'up',
                    tone: 'good',
                });
            });

            it('compte comme une baisse le passage de -100 à -150', () => {
                expect(calculateEvolution(-150, -100, 'higher-is-better')).toEqual({
                    change: -50,
                    direction: 'down',
                    tone: 'bad',
                });
            });
        });

        describe('seuil de négligeabilité (0,5 %)', () => {
            it('considère stable une variation juste sous le seuil (+0,4 %)', () => {
                expect(calculateEvolution(100.4, 100, 'higher-is-better')).toMatchObject({
                    direction: 'flat',
                    tone: 'neutral',
                });
            });

            it('considère stable une baisse juste sous le seuil (-0,4 %)', () => {
                expect(calculateEvolution(99.6, 100, 'higher-is-better')).toMatchObject({
                    direction: 'flat',
                    tone: 'neutral',
                });
            });

            it('ne considère plus stable une hausse pile au seuil (+0,5 %)', () => {
                expect(calculateEvolution(100.5, 100, 'higher-is-better')).toEqual({
                    change: 0.5,
                    direction: 'up',
                    tone: 'good',
                });
            });

            it('ne considère plus stable une baisse pile au seuil (-0,5 %)', () => {
                expect(calculateEvolution(99.5, 100, 'higher-is-better')).toEqual({
                    change: -0.5,
                    direction: 'down',
                    tone: 'bad',
                });
            });

            it('garde un ton neutre en zone stable, même avec une polarité "lower-is-better"', () => {
                expect(calculateEvolution(100.4, 100, 'lower-is-better')?.tone).toBe('neutral');
            });

            it('renvoie une évolution stable quand les valeurs sont identiques', () => {
                expect(calculateEvolution(100, 100, 'higher-is-better')).toEqual({
                    change: 0,
                    direction: 'flat',
                    tone: 'neutral',
                });
            });

            it('expose les seuils attendus', () => {
                expect(NEGLIGIBLE_RELATIVE_CHANGE).toBe(0.5);
                expect(NEGLIGIBLE_POINTS_CHANGE).toBe(0.1);
            });
        });

        describe('arrondi', () => {
            it('arrondit à une décimale (+33,333… % -> 33,3)', () => {
                expect(calculateEvolution(4, 3, 'higher-is-better')?.change).toBe(33.3);
            });

            it('arrondit à une décimale (-33,333… % -> -33,3)', () => {
                expect(calculateEvolution(2, 3, 'higher-is-better')?.change).toBe(-33.3);
            });

            it('arrondit à la décimale supérieure à partir de ,05 (1,26 % -> 1,3)', () => {
                expect(calculateEvolution(101.26, 100, 'higher-is-better')?.change).toBe(1.3);
            });
        });
    });

    describe('mode points', () => {
        it('calcule l\'écart absolu et non un pourcentage (2,1 -> 2,4 = +0,3 pt)', () => {
            expect(calculateEvolution(2.4, 2.1, 'higher-is-better', 'points')).toEqual({
                change: 0.3,
                direction: 'up',
                tone: 'good',
            });
        });

        it('calcule une baisse en points', () => {
            expect(calculateEvolution(1.8, 2.1, 'higher-is-better', 'points')).toEqual({
                change: -0.3,
                direction: 'down',
                tone: 'bad',
            });
        });

        it('reste calculable quand la valeur précédente est nulle (pas de division)', () => {
            expect(calculateEvolution(2.4, 0, 'higher-is-better', 'points')).toEqual({
                change: 2.4,
                direction: 'up',
                tone: 'good',
            });
        });

        it('reste calculable quand les deux valeurs sont nulles', () => {
            expect(calculateEvolution(0, 0, 'higher-is-better', 'points')).toEqual({
                change: 0,
                direction: 'flat',
                tone: 'neutral',
            });
        });

        it('arrondit à une décimale', () => {
            expect(calculateEvolution(12.34, 10, 'higher-is-better', 'points')?.change).toBe(2.3);
        });

        describe('seuil de négligeabilité (0,1 pt)', () => {
            it('considère stable un écart juste sous le seuil (0,09 pt)', () => {
                expect(calculateEvolution(0.09, 0, 'higher-is-better', 'points')).toMatchObject({
                    direction: 'flat',
                    tone: 'neutral',
                });
            });

            it('considère stable un recul juste sous le seuil (-0,09 pt)', () => {
                expect(calculateEvolution(0, 0.09, 'higher-is-better', 'points')).toMatchObject({
                    direction: 'flat',
                    tone: 'neutral',
                });
            });

            it('ne considère plus stable un écart pile au seuil (0,1 pt)', () => {
                expect(calculateEvolution(0.1, 0, 'higher-is-better', 'points')).toEqual({
                    change: 0.1,
                    direction: 'up',
                    tone: 'good',
                });
            });

            it('ne considère plus stable un recul pile au seuil (-0,1 pt)', () => {
                expect(calculateEvolution(0, 0.1, 'higher-is-better', 'points')).toEqual({
                    change: -0.1,
                    direction: 'down',
                    tone: 'bad',
                });
            });

            // Le seuil des points (0,1) est plus fin que celui du relatif (0,5) : un écart de
            // 0,3 doit compter en points mais pas en pourcentage.
            it('applique son propre seuil, distinct du mode relatif', () => {
                expect(calculateEvolution(0.3, 0, 'higher-is-better', 'points')?.direction).toBe('up');
                expect(calculateEvolution(100.3, 100, 'higher-is-better', 'relative')?.direction).toBe('flat');
            });
        });
    });

    describe('polarité', () => {
        // [polarité, ton attendu pour une hausse, ton attendu pour une baisse]
        it.each([
            ['higher-is-better', 'good', 'bad'],
            ['lower-is-better', 'bad', 'good'],
            ['neutral', 'neutral', 'neutral'],
        ] as const)('%s : hausse -> %s, baisse -> %s', (polarity, upTone, downTone) => {
            expect(calculateEvolution(120, 100, polarity)?.tone).toBe(upTone);
            expect(calculateEvolution(80, 100, polarity)?.tone).toBe(downTone);
        });

        it.each([
            ['higher-is-better', 'good', 'bad'],
            ['lower-is-better', 'bad', 'good'],
            ['neutral', 'neutral', 'neutral'],
        ] as const)('%s en mode points : hausse -> %s, baisse -> %s', (polarity, upTone, downTone) => {
            expect(calculateEvolution(3, 2, polarity, 'points')?.tone).toBe(upTone);
            expect(calculateEvolution(1, 2, polarity, 'points')?.tone).toBe(downTone);
        });

        it('conserve la direction réelle quelle que soit la polarité', () => {
            expect(calculateEvolution(120, 100, 'lower-is-better')?.direction).toBe('up');
            expect(calculateEvolution(80, 100, 'lower-is-better')?.direction).toBe('down');
            expect(calculateEvolution(120, 100, 'neutral')?.direction).toBe('up');
        });
    });
});
