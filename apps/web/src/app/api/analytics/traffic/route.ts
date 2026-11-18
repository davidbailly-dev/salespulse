import { NextRequest } from 'next/server';
import { getAnalyticsDataset } from '../../../../lib/mock-data/store';
import { filterTraffic } from '../../../../lib/mock-data/analyticsReports';
import { TrafficRowListSchema } from '@salespulse/contracts';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const { traffic } = getAnalyticsDataset();

    const filteredTraffic = filterTraffic(traffic, {
        from: searchParams.get('from'),
        to: searchParams.get('to'),
        // Sans param `shop`, on renvoie toutes les boutiques (vue "Toutes les boutiques").
        shop: searchParams.get('shop'),
    });

    return Response.json(TrafficRowListSchema.parse(filteredTraffic));
}
