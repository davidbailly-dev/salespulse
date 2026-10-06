import { useQuery } from '@tanstack/react-query';
import { useShopFilter } from '../filters/useShopFilter';
import { SearchTermStatListSchema, type SearchTermStat } from '../mock-data/schemas';
import { buildAnalyticsUrl, type AnalyticsDateRange } from './analyticsQuery';

async function fetchSearchTermStats(dateRange?: AnalyticsDateRange, shopId?: string): Promise<SearchTermStat[]> {
    const response = await fetch(buildAnalyticsUrl('search-terms', dateRange, shopId));

    if (!response.ok) {
        throw new Error(`Failed to fetch search terms: ${response.status}`);
    }

    return SearchTermStatListSchema.parse(await response.json());
}

// Termes triés par volume décroissant, déjà agrégés sur la plage par l'API.
export function useSearchTermStats(dateRange?: AnalyticsDateRange) {
    const shopId = useShopFilter();

    return useQuery({
        queryKey: ['analytics', 'search-terms', dateRange, shopId],
        queryFn: () => fetchSearchTermStats(dateRange, shopId),
    });
}
