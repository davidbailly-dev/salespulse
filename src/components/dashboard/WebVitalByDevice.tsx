'use client';

import { calculateWebVitalByDevice, rateWebVital, type WebVitalMetric, type WebVitalRating } from '../../lib/kpis/webVitals';
import { useWebVitals } from '../../lib/queries/useWebVitals';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { CardList } from '../ui/Card';
import { deviceLabels } from './deviceLabels';

const secondsFormatter = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const clsFormatter = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const millisecondsFormatter = new Intl.NumberFormat('fr-FR');

const toneByRating = { good: 'success', 'needs-improvement': 'warning', poor: 'danger' } as const satisfies Record<
    WebVitalRating,
    'success' | 'warning' | 'danger'
>;

function formatValue(metric: WebVitalMetric, value: number): string {
    if (metric === 'lcp' || metric === 'loadTime') return `${secondsFormatter.format(value / 1000)} s`;
    if (metric === 'inp') return `${millisecondsFormatter.format(value)} ms`;
    return clsFormatter.format(value);
}

export function WebVitalByDevice({ metric }: { metric: WebVitalMetric }) {
    const { data: webVitals, isLoading, isError } = useWebVitals(useDateRangeFilter());

    if (isLoading || !webVitals) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const items = calculateWebVitalByDevice(webVitals, metric)
        .sort((a, b) => a.value - b.value)
        .map(({ device, value }) => {
            const rating = rateWebVital(metric, value);

            return {
                id: device,
                label: deviceLabels[device],
                value: formatValue(metric, value),
                tone: rating ? toneByRating[rating] : ('default' as const),
            };
        });

    return <CardList items={items} />;
}
