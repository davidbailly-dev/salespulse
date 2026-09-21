import { NextRequest } from 'next/server';
import { getDataset } from '../../../lib/mock-data/store';
import { OrderListSchema } from '../../../lib/mock-data/schemas';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const { orders } = getDataset();

    // Comparaison lexicographique valide car les dates sont au format ISO 8601.
    const filteredOrders = orders.filter((order) => {
        if (from && order.date < from) return false;
        if (to && order.date > to) return false;
        return true;
    });

    return Response.json(OrderListSchema.parse(filteredOrders));
}
