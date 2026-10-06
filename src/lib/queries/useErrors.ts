import { useQuery } from '@tanstack/react-query';
import { useShopFilter } from '../filters/useShopFilter';
import { ErrorRowListSchema, type ErrorRow } from '../mock-data/schemas';
import { buildAnalyticsUrl, type AnalyticsDateRange } from './analyticsQuery';

async function fetchErrors(dateRange?: AnalyticsDateRange, shopId?: string): Promise<ErrorRow[]> {
    const response = await fetch(buildAnalyticsUrl('errors', dateRange, shopId));

    if (!response.ok) {
        throw new Error(`Failed to fetch errors: ${response.status}`);
    }

    return ErrorRowListSchema.parse(await response.json());
}

// Comme useTraffic, la boutique est lue ici depuis l'URL et la plage de dates passée explicitement.
export function useErrors(dateRange?: AnalyticsDateRange) {
    const shopId = useShopFilter();

    return useQuery({
        queryKey: ['analytics', 'errors', dateRange, shopId],
        queryFn: () => fetchErrors(dateRange, shopId),
    });
}
