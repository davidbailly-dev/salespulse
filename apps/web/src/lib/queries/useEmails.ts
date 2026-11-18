import { useQuery } from '@tanstack/react-query';
import { useShopFilter } from '../filters/useShopFilter';
import { EmailRowListSchema, type EmailRow } from '@salespulse/contracts';
import { buildAnalyticsUrl, type AnalyticsDateRange } from './analyticsQuery';

async function fetchEmails(dateRange?: AnalyticsDateRange, shopId?: string): Promise<EmailRow[]> {
    const response = await fetch(buildAnalyticsUrl('emails', dateRange, shopId));

    if (!response.ok) {
        throw new Error(`Failed to fetch emails: ${response.status}`);
    }

    return EmailRowListSchema.parse(await response.json());
}

// Comme useTraffic, la boutique est lue ici depuis l'URL et la plage de dates passée explicitement.
export function useEmails(dateRange?: AnalyticsDateRange, options?: { enabled?: boolean }) {
    const shopId = useShopFilter();

    return useQuery({
        queryKey: ['analytics', 'emails', dateRange, shopId],
        queryFn: () => fetchEmails(dateRange, shopId),
        enabled: options?.enabled ?? true,
    });
}
