import { getDataset } from '../../../lib/mock-data/store';
import { ShopListSchema } from '../../../lib/mock-data/schemas';

export async function GET() {
    const { shops } = getDataset();

    return Response.json(ShopListSchema.parse(shops));
}
