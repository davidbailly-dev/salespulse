import { NextRequest } from 'next/server';
import { getAnalyticsDataset } from '../../../../lib/mock-data/store';
import { filterEmails } from '../../../../lib/mock-data/analyticsReports';
import { EmailRowListSchema } from '@salespulse/contracts';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const { emails } = getAnalyticsDataset();

    const filteredEmails = filterEmails(emails, {
        from: searchParams.get('from'),
        to: searchParams.get('to'),
        // Sans param `shop`, on renvoie toutes les boutiques (vue "Toutes les boutiques").
        shop: searchParams.get('shop'),
    });

    return Response.json(EmailRowListSchema.parse(filteredEmails));
}
