import { http, HttpResponse } from 'msw';
import { getDataset } from '../lib/mock-data/store';
import { CustomerListSchema, OrderListSchema, ProductListSchema } from '../lib/mock-data/schemas';

export const handlers = [
    http.get('/api/orders', ({ request }) => {
        const url = new URL(request.url);
        const from = url.searchParams.get('from');
        const to = url.searchParams.get('to');

        const { orders } = getDataset();

        // Comparaison lexicographique valide car les dates sont au format ISO 8601.
        const filteredOrders = orders.filter((order) => {
            if (from && order.date < from) return false;
            if (to && order.date > to) return false;
            return true;
        });

        return HttpResponse.json(OrderListSchema.parse(filteredOrders));
    }),

    http.get('/api/products', () => {
        const { products } = getDataset();

        return HttpResponse.json(ProductListSchema.parse(products));
    }),

    http.get('/api/customers', () => {
        const { customers } = getDataset();

        return HttpResponse.json(CustomerListSchema.parse(customers));
    }),
];
