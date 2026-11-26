import { z } from 'zod';
// Dépendance propre à la démo : le canal et l'appareil sont des données de visite, sorties du
// modèle de commande du backend (jalon 010, D15). Elle disparaît avec le schéma `Order`.
import { ChannelSchema, DeviceSchema } from './analytics';

export const CategorySchema = z.enum([
    'Armes',
    'Armures',
    'Potions',
    'Grimoires',
    'Artefacts',
]);
export type Category = z.infer<typeof CategorySchema>;

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
    email: z.email(),
    registeredAt: z.iso.datetime(),
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

export const OrderSchema = z.object({
    id: z.string(),
    shopId: z.string(),
    customerId: z.string(),
    date: z.iso.datetime(),
    status: OrderStatusSchema,
    lines: z.array(OrderLineSchema).min(1),
    totalAmount: z.number().nonnegative(),
    // Canal et appareil de la session ayant mené à la commande : ils permettent d'attribuer le
    // CA à un canal (ROAS, CAC) et de comparer la conversion mobile/desktop.
    channel: ChannelSchema,
    device: DeviceSchema,
});
export type Order = z.infer<typeof OrderSchema>;

export const OrderListSchema = z.array(OrderSchema);
