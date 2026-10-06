import { z } from 'zod';

export const CategorySchema = z.enum([
    'Armes',
    'Armures',
    'Potions',
    'Grimoires',
    'Artefacts',
]);
export type Category = z.infer<typeof CategorySchema>;

export const ShopSchema = z.object({
    id: z.string(),
    name: z.string(),
});
export type Shop = z.infer<typeof ShopSchema>;

export const ShopListSchema = z.array(ShopSchema);

export const ProductSchema = z.object({
    id: z.string(),
    shopId: z.string(),
    name: z.string(),
    category: CategorySchema,
    price: z.number().positive(),
});
export type Product = z.infer<typeof ProductSchema>;

export const ProductListSchema = z.array(ProductSchema);

export const CustomerSchema = z.object({
    id: z.string(),
    shopId: z.string(),
    name: z.string(),
    email: z.string().email(),
    registeredAt: z.string().datetime(),
});
export type Customer = z.infer<typeof CustomerSchema>;

export const CustomerListSchema = z.array(CustomerSchema);

export const OrderStatusSchema = z.enum(['completed', 'abandoned', 'refunded']);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderLineSchema = z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
});
export type OrderLine = z.infer<typeof OrderLineSchema>;

// Canal d'acquisition et appareil de la session ayant mené à la commande : ils permettent
// d'attribuer le CA à un canal (ROAS, CAC) et de comparer la conversion mobile/desktop.
export const ChannelSchema = z.enum(['organic', 'paid', 'direct', 'social', 'email', 'referral']);
export type Channel = z.infer<typeof ChannelSchema>;

export const DeviceSchema = z.enum(['desktop', 'mobile', 'tablet']);
export type Device = z.infer<typeof DeviceSchema>;

export const OrderSchema = z.object({
    id: z.string(),
    shopId: z.string(),
    customerId: z.string(),
    date: z.string().datetime(),
    status: OrderStatusSchema,
    lines: z.array(OrderLineSchema).min(1),
    totalAmount: z.number().nonnegative(),
    channel: ChannelSchema,
    device: DeviceSchema,
});
export type Order = z.infer<typeof OrderSchema>;

export const OrderListSchema = z.array(OrderSchema);

export const DatasetSchema = z.object({
    shops: z.array(ShopSchema),
    products: z.array(ProductSchema),
    customers: z.array(CustomerSchema),
    orders: z.array(OrderSchema),
});
export type Dataset = z.infer<typeof DatasetSchema>;

// --- Analytics (trafic) ---
// Calqué sur ce qu'exposerait un connecteur GA4 (voir CLAUDE.md) : le trafic est stocké en
// lignes agrégées par jour, boutique, canal et appareil, jamais en sessions individuelles.

export const TrafficRowSchema = z.object({
    // Début du jour (UTC) : la granularité est la journée.
    date: z.string().datetime(),
    shopId: z.string(),
    channel: ChannelSchema,
    device: DeviceSchema,
    sessions: z.number().int().nonnegative(),
    users: z.number().int().nonnegative(),
    newUsers: z.number().int().nonnegative(),
    engagedSessions: z.number().int().nonnegative(),
    // Sessions allant au moins aux trois quarts de la page (sous-ensemble des sessions engagées).
    deepScrollSessions: z.number().int().nonnegative(),
    // Durée cumulée (et non moyenne) pour pouvoir agréger sans biais : moyenne = total / sessions.
    totalSessionDurationSeconds: z.number().int().nonnegative(),
    pageViews: z.number().int().nonnegative(),
});
export type TrafficRow = z.infer<typeof TrafficRowSchema>;

export const TrafficRowListSchema = z.array(TrafficRowSchema);

export const PageTypeSchema = z.enum(['product', 'other']);
export type PageType = z.infer<typeof PageTypeSchema>;

const pageFields = {
    path: z.string(),
    title: z.string(),
    type: PageTypeSchema,
    productId: z.string().optional(),
    views: z.number().int().nonnegative(),
    // Nombre de sessions ayant quitté le site depuis cette page.
    exits: z.number().int().nonnegative(),
};

// Ligne quotidienne stockée côté serveur.
export const PageViewRowSchema = z.object({
    date: z.string().datetime(),
    shopId: z.string(),
    ...pageFields,
});
export type PageViewRow = z.infer<typeof PageViewRowSchema>;

// Rapport renvoyé par l'API : une ligne par page, agrégée sur la plage de dates demandée.
export const PageStatSchema = z.object(pageFields);
export type PageStat = z.infer<typeof PageStatSchema>;

export const PageStatListSchema = z.array(PageStatSchema);

const searchFields = {
    term: z.string(),
    // false = recherche sans résultat, donc besoin non satisfait.
    hasResults: z.boolean(),
    searches: z.number().int().nonnegative(),
};

export const SearchRowSchema = z.object({
    date: z.string().datetime(),
    shopId: z.string(),
    ...searchFields,
});
export type SearchRow = z.infer<typeof SearchRowSchema>;

export const SearchTermStatSchema = z.object(searchFields);
export type SearchTermStat = z.infer<typeof SearchTermStatSchema>;

export const SearchTermStatListSchema = z.array(SearchTermStatSchema);

export const AnalyticsDatasetSchema = z.object({
    traffic: TrafficRowListSchema,
    pageViews: z.array(PageViewRowSchema),
    searches: z.array(SearchRowSchema),
});
export type AnalyticsDataset = z.infer<typeof AnalyticsDatasetSchema>;
