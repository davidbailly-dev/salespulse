'use client';

import { calculateTopPages, type TopPagesType } from '../../lib/kpis/topPages';
import { usePageStats } from '../../lib/queries/usePageStats';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { CardList } from '../ui/Card';

const numberFormatter = new Intl.NumberFormat('fr-FR');

export function TopPages({ type }: { type: TopPagesType }) {
    const { data: pages, isLoading, isError } = usePageStats(useDateRangeFilter());

    if (isLoading || !pages) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const items = calculateTopPages(pages, type).map((page) => ({
        id: page.path,
        label: page.title,
        value: numberFormatter.format(page.views),
    }));

    return <CardList items={items} />;
}
