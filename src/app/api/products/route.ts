import { getDataset } from '../../../lib/mock-data/store';
import { ProductListSchema } from '../../../lib/mock-data/schemas';

export async function GET() {
    const { products } = getDataset();

    return Response.json(ProductListSchema.parse(products));
}
