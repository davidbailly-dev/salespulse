import { Device, WebVitalsRow } from '../mock-data/schemas';

export type WebVitalMetric = 'lcp' | 'inp' | 'cls' | 'loadTime';
export type WebVitalRating = 'good' | 'needs-improvement' | 'poor';

// Seuils publiés par Google (web.dev) : jusqu'à `good` inclus, la valeur est "bonne" ; au-delà de
// `poor`, elle est "mauvaise" ; entre les deux, elle "doit être améliorée". Pas de seuil pour le
// temps de chargement, qui n'est pas un Core Web Vital.
const THRESHOLDS: Record<Exclude<WebVitalMetric, 'loadTime'>, { good: number; poor: number }> = {
    lcp: { good: 2500, poor: 4000 },
    inp: { good: 200, poor: 500 },
    cls: { good: 0.1, poor: 0.25 },
};

const ROW_FIELDS = { lcp: 'lcpMs', inp: 'inpMs', cls: 'cls', loadTime: 'loadTimeMs' } as const;

export type DeviceWebVital = {
    device: Device;
    // LCP, INP et temps de chargement en millisecondes, CLS sans unité.
    value: number;
};

/** Note Google d'une valeur, `null` pour le temps de chargement (pas de seuil officiel). */
export function rateWebVital(metric: WebVitalMetric, value: number): WebVitalRating | null {
    if (metric === 'loadTime') return null;

    const { good, poor } = THRESHOLDS[metric];
    if (value <= good) return 'good';
    return value <= poor ? 'needs-improvement' : 'poor';
}

/**
 * Valeur d'une métrique par appareil : moyenne des p75 quotidiens pondérée par `samples`. C'est
 * une approximation du vrai p75 de la période, un percentile n'étant pas additif (voir
 * `WebVitalsRowSchema`). Les appareils sont séparés, comme dans CrUX : un mobile lent ne doit
 * pas être masqué par un desktop rapide.
 */
export function calculateWebVitalByDevice(rows: WebVitalsRow[], metric: WebVitalMetric): DeviceWebVital[] {
    const field = ROW_FIELDS[metric];
    const totalsByDevice = new Map<Device, { weightedSum: number; samples: number }>();

    rows.forEach((row) => {
        const totals = totalsByDevice.get(row.device) ?? { weightedSum: 0, samples: 0 };
        totals.weightedSum += row[field] * row.samples;
        totals.samples += row.samples;
        totalsByDevice.set(row.device, totals);
    });

    const digits = metric === 'cls' ? 1000 : 1;

    return [...totalsByDevice.entries()]
        .filter(([, totals]) => totals.samples > 0)
        .map(([device, totals]) => ({ device, value: Math.round((totals.weightedSum / totals.samples) * digits) / digits }));
}
