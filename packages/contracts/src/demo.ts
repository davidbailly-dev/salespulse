import { z } from 'zod';
import {
    AdSpendRowListSchema,
    EmailRowListSchema,
    ErrorRowListSchema,
    PageViewRowSchema,
    SearchRowSchema,
    TrafficRowListSchema,
    WebVitalsRowListSchema,
} from './analytics';
import { CustomerSchema, OrderSchema, ProductSchema } from './sales';
import { ShopSchema } from './shops';

// Jeux de données complets du store mocké, côté serveur.

export const DatasetSchema = z.object({
    shops: z.array(ShopSchema),
    products: z.array(ProductSchema),
    customers: z.array(CustomerSchema),
    orders: z.array(OrderSchema),
});
export type Dataset = z.infer<typeof DatasetSchema>;

export const AnalyticsDatasetSchema = z.object({
    traffic: TrafficRowListSchema,
    pageViews: z.array(PageViewRowSchema),
    searches: z.array(SearchRowSchema),
    adSpend: AdSpendRowListSchema,
    webVitals: WebVitalsRowListSchema,
    errors: ErrorRowListSchema,
    emails: EmailRowListSchema,
});
export type AnalyticsDataset = z.infer<typeof AnalyticsDatasetSchema>;
