import { useQuery } from '@tanstack/react-query';
import { useShopFilter } from '../filters/useShopFilter';
import { PageStatListSchema, type PageStat } from '../mock-data/schemas';
import { buildAnalyticsUrl, type AnalyticsDateRange } from './analyticsQuery';

async function fetchPageStats(dateRange?: AnalyticsDateRange, shopId?: string): Promise<PageStat[]> {
    const response = await fetch(buildAnalyticsUrl('pages', dateRange, shopId));

    if (!response.ok) {
        throw new Error(`Failed to fetch page stats: ${response.status}`);
    }

    return PageStatListSchema.parse(await response.json());
}

// Pages triées par vues décroissantes, déjà agrégées sur la plage par l'API.
export function usePageStats(dateRange?: AnalyticsDateRange) {
    const shopId = useShopFilter();

    return useQuery({
        queryKey: ['analytics', 'pages', dateRange, shopId],
        queryFn: () => fetchPageStats(dateRange, shopId),
    });
}
