import { NextRequest } from 'next/server';
import { getAnalyticsDataset } from '../../../../lib/mock-data/store';
import { buildPageStats } from '../../../../lib/mock-data/analyticsReports';
import { PageStatListSchema } from '../../../../lib/mock-data/schemas';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const { pageViews } = getAnalyticsDataset();

    const pageStats = buildPageStats(pageViews, {
        from: searchParams.get('from'),
        to: searchParams.get('to'),
        // Sans param `shop`, on renvoie toutes les boutiques (vue "Toutes les boutiques").
        shop: searchParams.get('shop'),
    });

    return Response.json(PageStatListSchema.parse(pageStats));
}
