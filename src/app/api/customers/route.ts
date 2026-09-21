import { getDataset } from '../../../lib/mock-data/store';
import { CustomerListSchema } from '../../../lib/mock-data/schemas';

export async function GET() {
    const { customers } = getDataset();

    return Response.json(CustomerListSchema.parse(customers));
}
