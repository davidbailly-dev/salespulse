import { z } from 'zod';

export const CategorySchema = z.enum([
    'Clothing',
    'Shoes',
    'Accessories',
    'Electronics',
    'Home',
]);
export type Category = z.infer<typeof CategorySchema>;

export const ProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    category: CategorySchema,
    price: z.number().positive(),
});
export type Product = z.infer<typeof ProductSchema>;

export const CustomerSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    registeredAt: z.string().datetime(),
});
export type Customer = z.infer<typeof CustomerSchema>;

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
    customerId: z.string(),
    date: z.string().datetime(),
    status: OrderStatusSchema,
    lines: z.array(OrderLineSchema).min(1),
    totalAmount: z.number().nonnegative(),
});
export type Order = z.infer<typeof OrderSchema>;

export const DatasetSchema = z.object({
    products: z.array(ProductSchema),
    customers: z.array(CustomerSchema),
    orders: z.array(OrderSchema),
});
export type Dataset = z.infer<typeof DatasetSchema>;
