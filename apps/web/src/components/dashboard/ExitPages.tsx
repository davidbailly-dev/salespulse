'use client';

import { calculateExitPages } from '../../lib/kpis/exitPages';
import { usePageStats } from '../../lib/queries/usePageStats';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { CardList } from '../ui/Card';

const numberFormatter = new Intl.NumberFormat('fr-FR');

export function ExitPages() {
    const { data: pages, isLoading, isError } = usePageStats(useDateRangeFilter());

    if (isLoading || !pages) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const items = calculateExitPages(pages).map((page) => ({
        id: page.path,
        label: page.title,
        value: `${numberFormatter.format(page.exits)} (${page.exitRate} %)`,
    }));

    return <CardList items={items} />;
}
