import { describe, expect, it } from 'vitest';
import { buildWebVitalsRow } from '../testing/builders';
import { calculateWebVitalByDevice, rateWebVital } from './webVitals';

// Valeur d'un appareil dans le résultat, pour ne pas dépendre de l'ordre des appareils.
const valueByDevice = (result: { device: string; value: number }[]) =>
    Object.fromEntries(result.map((entry) => [entry.device, entry.value]));

describe('rateWebVital', () => {
    // Seuils Google : jusqu'à `good` inclus -> bon ; jusqu'à `poor` inclus -> à améliorer ; au-delà -> mauvais.
    it.each([
        ['lcp', 0, 'good'],
        ['lcp', 2500, 'good'],
        ['lcp', 2501, 'needs-improvement'],
        ['lcp', 4000, 'needs-improvement'],
        ['lcp', 4001, 'poor'],
        ['inp', 0, 'good'],
        ['inp', 200, 'good'],
        ['inp', 201, 'needs-improvement'],
        ['inp', 500, 'needs-improvement'],
        ['inp', 501, 'poor'],
        ['cls', 0, 'good'],
        ['cls', 0.1, 'good'],
        ['cls', 0.11, 'needs-improvement'],
        ['cls', 0.25, 'needs-improvement'],
        ['cls', 0.26, 'poor'],
    ] as const)('%s à %s -> %s', (metric, value, expectedRating) => {
        expect(rateWebVital(metric, value)).toBe(expectedRating);
    });

    it.each([0, 1000, 99999])('ne note pas le temps de chargement (%s ms), qui n\'a pas de seuil officiel', (value) => {
        expect(rateWebVital('loadTime', value)).toBeNull();
    });
});

describe('calculateWebVitalByDevice', () => {
    it('renvoie une liste vide pour une liste vide', () => {
        expect(calculateWebVitalByDevice([], 'lcp')).toEqual([]);
    });

    it('lit le bon champ de la ligne pour chaque métrique', () => {
        const rows = [buildWebVitalsRow({ device: 'desktop', lcpMs: 2000, inpMs: 150, cls: 0.05, loadTimeMs: 1500 })];

        expect(calculateWebVitalByDevice(rows, 'lcp')).toEqual([{ device: 'desktop', value: 2000 }]);
        expect(calculateWebVitalByDevice(rows, 'inp')).toEqual([{ device: 'desktop', value: 150 }]);
        expect(calculateWebVitalByDevice(rows, 'cls')).toEqual([{ device: 'desktop', value: 0.05 }]);
        expect(calculateWebVitalByDevice(rows, 'loadTime')).toEqual([{ device: 'desktop', value: 1500 }]);
    });

    // Moyenne pondérée par les échantillons : (2000 × 100 + 3000 × 300) / 400 = 2750 ms,
    // et non la moyenne simple des deux jours (2500 ms).
    it('pondère la moyenne par le nombre d\'échantillons', () => {
        const rows = [
            buildWebVitalsRow({ device: 'desktop', lcpMs: 2000, samples: 100 }),
            buildWebVitalsRow({ device: 'desktop', lcpMs: 3000, samples: 300 }),
        ];

        expect(calculateWebVitalByDevice(rows, 'lcp')).toEqual([{ device: 'desktop', value: 2750 }]);
    });

    it('sépare les appareils (un mobile lent n\'est pas masqué par un desktop rapide)', () => {
        const rows = [
            buildWebVitalsRow({ device: 'desktop', lcpMs: 2000 }),
            buildWebVitalsRow({ device: 'mobile', lcpMs: 4000 }),
        ];

        expect(valueByDevice(calculateWebVitalByDevice(rows, 'lcp'))).toEqual({ desktop: 2000, mobile: 4000 });
    });

    it('arrondit les millisecondes à l\'entier (2000,67 -> 2001)', () => {
        const rows = [
            buildWebVitalsRow({ device: 'desktop', lcpMs: 2000, samples: 1 }),
            buildWebVitalsRow({ device: 'desktop', lcpMs: 2001, samples: 2 }),
        ];

        expect(calculateWebVitalByDevice(rows, 'lcp')).toEqual([{ device: 'desktop', value: 2001 }]);
    });

    it('arrondit le CLS à 3 décimales (0,0967 -> 0,097)', () => {
        const rows = [
            buildWebVitalsRow({ device: 'desktop', cls: 0.05, samples: 100 }),
            buildWebVitalsRow({ device: 'desktop', cls: 0.12, samples: 200 }),
        ];

        expect(calculateWebVitalByDevice(rows, 'cls')).toEqual([{ device: 'desktop', value: 0.097 }]);
    });

    it('exclut un appareil sans aucun échantillon (pas de division par zéro)', () => {
        const rows = [
            buildWebVitalsRow({ device: 'desktop', samples: 0, lcpMs: 9999 }),
            buildWebVitalsRow({ device: 'mobile', samples: 10, lcpMs: 3000 }),
        ];

        expect(calculateWebVitalByDevice(rows, 'lcp')).toEqual([{ device: 'mobile', value: 3000 }]);
    });
});
