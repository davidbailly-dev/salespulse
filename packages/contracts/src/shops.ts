import { z } from 'zod';

export const ShopSchema = z.object({
    id: z.string(),
    name: z.string(),
});
export type Shop = z.infer<typeof ShopSchema>;

export const ShopListSchema = z.array(ShopSchema);
