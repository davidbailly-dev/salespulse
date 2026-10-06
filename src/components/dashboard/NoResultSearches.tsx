'use client';

import { calculateNoResultSearches } from '../../lib/kpis/noResultSearches';
import { useSearchTermStats } from '../../lib/queries/useSearchTermStats';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { CardList } from '../ui/Card';
import { KpiValue } from './KpiValue';

const numberFormatter = new Intl.NumberFormat('fr-FR');

export function NoResultSearches() {
    const { data: stats, isLoading, isError } = useSearchTermStats(useDateRangeFilter());

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const { rate, terms } = calculateNoResultSearches(stats);
    const items = terms.map((stat) => ({
        id: stat.term,
        label: stat.term,
        value: numberFormatter.format(stat.searches),
        tone: 'danger' as const,
    }));

    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-col items-center gap-1">
                <KpiValue value={rate} unit="%" />
                <span className="text-xs text-gray-400">des recherches sans résultat</span>
            </div>

            <CardList items={items} />
        </div>
    );
}
