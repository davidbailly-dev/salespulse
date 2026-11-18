import { NextRequest } from 'next/server';
import { getAnalyticsDataset } from '../../../../lib/mock-data/store';
import { filterErrors } from '../../../../lib/mock-data/analyticsReports';
import { ErrorRowListSchema } from '@salespulse/contracts';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const { errors } = getAnalyticsDataset();

    const filteredErrors = filterErrors(errors, {
        from: searchParams.get('from'),
        to: searchParams.get('to'),
        // Sans param `shop`, on renvoie toutes les boutiques (vue "Toutes les boutiques").
        shop: searchParams.get('shop'),
    });

    return Response.json(ErrorRowListSchema.parse(filteredErrors));
}
