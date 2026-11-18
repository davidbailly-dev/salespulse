'use client';

import { calculateTopSearchTerms } from '../../lib/kpis/topSearchTerms';
import { useSearchTermStats } from '../../lib/queries/useSearchTermStats';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { CardList } from '../ui/Card';

const numberFormatter = new Intl.NumberFormat('fr-FR');

export function TopSearchTerms() {
    const { data: stats, isLoading, isError } = useSearchTermStats(useDateRangeFilter());

    if (isLoading || !stats) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const items = calculateTopSearchTerms(stats).map((stat) => ({
        id: stat.term,
        label: stat.term,
        value: numberFormatter.format(stat.searches),
    }));

    return <CardList items={items} />;
}
