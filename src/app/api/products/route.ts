import { NextRequest } from 'next/server';
import { getDataset } from '../../../lib/mock-data/store';
import { ProductListSchema } from '../../../lib/mock-data/schemas';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    // Sans param `shop`, on renvoie toutes les boutiques (vue "Toutes les boutiques").
    const shop = searchParams.get('shop');

    const { products } = getDataset();
    const filteredProducts = shop ? products.filter((product) => product.shopId === shop) : products;

    return Response.json(ProductListSchema.parse(filteredProducts));
}
