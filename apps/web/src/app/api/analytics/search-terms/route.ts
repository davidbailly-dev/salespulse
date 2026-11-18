import { NextRequest } from 'next/server';
import { getAnalyticsDataset } from '../../../../lib/mock-data/store';
import { buildSearchTermStats } from '../../../../lib/mock-data/analyticsReports';
import { SearchTermStatListSchema } from '@salespulse/contracts';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const { searches } = getAnalyticsDataset();

    const searchTermStats = buildSearchTermStats(searches, {
        from: searchParams.get('from'),
        to: searchParams.get('to'),
        // Sans param `shop`, on renvoie toutes les boutiques (vue "Toutes les boutiques").
        shop: searchParams.get('shop'),
    });

    return Response.json(SearchTermStatListSchema.parse(searchTermStats));
}
