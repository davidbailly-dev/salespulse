import { NextRequest } from 'next/server';
import { getDataset } from '../../../lib/mock-data/store';
import { CustomerListSchema } from '@salespulse/contracts';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    // Sans param `shop`, on renvoie toutes les boutiques (vue "Toutes les boutiques").
    const shop = searchParams.get('shop');

    const { customers } = getDataset();
    const filteredCustomers = shop ? customers.filter((customer) => customer.shopId === shop) : customers;

    return Response.json(CustomerListSchema.parse(filteredCustomers));
}
