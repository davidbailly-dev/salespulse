import { describe, expect, it } from 'vitest';
import {
    AdSpendRowSchema,
    CustomerSchema,
    EmailRowSchema,
    ErrorRowSchema,
    OrderLineSchema,
    OrderSchema,
    PageStatSchema,
    PageViewRowSchema,
    ProductSchema,
    SearchRowSchema,
    SearchTermStatSchema,
    ShopSchema,
    TrafficRowSchema,
    WebVitalsRowSchema,
} from '../mock-data/schemas';
import {
    buildAdSpendRow,
    buildCustomer,
    buildEmailRow,
    buildErrorRow,
    buildOrder,
    buildOrderLine,
    buildPageStat,
    buildPageViewRow,
    buildProduct,
    buildSearchRow,
    buildSearchTermStat,
    buildShop,
    buildTrafficRow,
    buildWebVitalsRow,
} from './builders';

// Garantit que les fixtures respectent toujours le contrat Zod : un test ne doit jamais
// s'appuyer sur une donnée que l'API n'aurait pas pu renvoyer.
describe('builders', () => {
    it.each([
        ['buildShop', buildShop, ShopSchema],
        ['buildProduct', buildProduct, ProductSchema],
        ['buildCustomer', buildCustomer, CustomerSchema],
        ['buildOrderLine', buildOrderLine, OrderLineSchema],
        ['buildOrder', buildOrder, OrderSchema],
        ['buildTrafficRow', buildTrafficRow, TrafficRowSchema],
        ['buildPageStat', buildPageStat, PageStatSchema],
        ['buildPageViewRow', buildPageViewRow, PageViewRowSchema],
        ['buildSearchTermStat', buildSearchTermStat, SearchTermStatSchema],
        ['buildSearchRow', buildSearchRow, SearchRowSchema],
        ['buildAdSpendRow', buildAdSpendRow, AdSpendRowSchema],
        ['buildWebVitalsRow', buildWebVitalsRow, WebVitalsRowSchema],
        ['buildErrorRow', buildErrorRow, ErrorRowSchema],
        ['buildEmailRow', buildEmailRow, EmailRowSchema],
    ] as const)('%s produit un objet valide', (_name, build, schema) => {
        expect(() => schema.parse(build())).not.toThrow();
    });

    it('applique les overrides', () => {
        expect(buildProduct({ price: 42 }).price).toBe(42);
    });

    describe('buildOrder', () => {
        it('déduit totalAmount des lignes', () => {
            const order = buildOrder({
                lines: [
                    buildOrderLine({ quantity: 2, unitPrice: 10 }),
                    buildOrderLine({ quantity: 1, unitPrice: 5.5 }),
                ],
            });

            expect(order.totalAmount).toBe(25.5);
        });

        it('respecte un totalAmount explicite', () => {
            expect(buildOrder({ totalAmount: 0 }).totalAmount).toBe(0);
        });
    });

    // Seule une page produit porte un `productId` : une autre page qui garderait celui du
    // défaut ferait compter à tort ce produit comme consulté.
    describe.each([
        ['buildPageStat', buildPageStat],
        ['buildPageViewRow', buildPageViewRow],
    ] as const)('%s', (_name, build) => {
        it('donne un productId à une page produit par défaut', () => {
            expect(build().productId).toBe('product-1');
        });

        it('ne garde pas le productId par défaut pour une page non produit', () => {
            expect(build({ type: 'other' })).not.toHaveProperty('productId');
        });

        it('respecte un productId explicite, même pour une page non produit', () => {
            expect(build({ type: 'other', productId: 'product-2' }).productId).toBe('product-2');
        });
    });
});
