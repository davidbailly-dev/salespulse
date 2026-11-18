import { NextRequest } from 'next/server';
import { getAnalyticsDataset } from '../../../../lib/mock-data/store';
import { filterAdSpend } from '../../../../lib/mock-data/analyticsReports';
import { AdSpendRowListSchema } from '../../../../lib/mock-data/schemas';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const { adSpend } = getAnalyticsDataset();

    const filteredAdSpend = filterAdSpend(adSpend, {
        from: searchParams.get('from'),
        to: searchParams.get('to'),
        // Sans param `shop`, on renvoie toutes les boutiques (vue "Toutes les boutiques").
        shop: searchParams.get('shop'),
    });

    return Response.json(AdSpendRowListSchema.parse(filteredAdSpend));
}
