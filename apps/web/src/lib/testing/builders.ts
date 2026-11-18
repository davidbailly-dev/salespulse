import {
    AdSpendRow,
    Customer,
    EmailRow,
    ErrorRow,
    Order,
    OrderLine,
    PageStat,
    PageViewRow,
    Product,
    SearchRow,
    SearchTermStat,
    Shop,
    TrafficRow,
    WebVitalsRow,
} from '@salespulse/contracts';

// Builders de fixtures pour les tests : chaque builder renvoie un objet valide au regard de son
// schéma Zod, avec des valeurs par défaut fixes (aucun aléatoire) que l'on surcharge via
// `overrides` pour ne décrire dans un test que ce qui compte pour lui.

export const DEFAULT_SHOP_ID = 'shop-test';
export const DEFAULT_DATE = '2026-01-15T00:00:00.000Z';

export function buildShop(overrides: Partial<Shop> = {}): Shop {
    return {
        id: DEFAULT_SHOP_ID,
        name: 'Boutique de test',
        ...overrides,
    };
}

export function buildProduct(overrides: Partial<Product> = {}): Product {
    return {
        id: 'product-1',
        shopId: DEFAULT_SHOP_ID,
        name: 'Épée de test',
        category: 'Armes',
        price: 100,
        ...overrides,
    };
}

export function buildCustomer(overrides: Partial<Customer> = {}): Customer {
    return {
        id: 'customer-1',
        shopId: DEFAULT_SHOP_ID,
        name: 'Client de test',
        email: 'client@example.com',
        registeredAt: '2025-06-01T00:00:00.000Z',
        ...overrides,
    };
}

export function buildOrderLine(overrides: Partial<OrderLine> = {}): OrderLine {
    return {
        productId: 'product-1',
        quantity: 1,
        unitPrice: 100,
        ...overrides,
    };
}

// Par défaut, `totalAmount` est déduit des lignes pour rester cohérent avec elles ; le
// surcharger explicitement permet de tester un total indépendamment des lignes.
export function buildOrder(overrides: Partial<Order> = {}): Order {
    const lines = overrides.lines ?? [buildOrderLine()];
    const totalAmount = lines.reduce((acc, line) => acc + line.quantity * line.unitPrice, 0);

    return {
        id: 'order-1',
        shopId: DEFAULT_SHOP_ID,
        customerId: 'customer-1',
        date: DEFAULT_DATE,
        status: 'completed',
        channel: 'organic',
        device: 'desktop',
        ...overrides,
        lines,
        totalAmount: overrides.totalAmount ?? totalAmount,
    };
}

export function buildTrafficRow(overrides: Partial<TrafficRow> = {}): TrafficRow {
    return {
        date: DEFAULT_DATE,
        shopId: DEFAULT_SHOP_ID,
        channel: 'organic',
        device: 'desktop',
        sessions: 100,
        users: 80,
        newUsers: 40,
        engagedSessions: 60,
        deepScrollSessions: 30,
        totalSessionDurationSeconds: 12000,
        pageViews: 300,
        ...overrides,
    };
}

export function buildPageStat(overrides: Partial<PageStat> = {}): PageStat {
    const page: PageStat = {
        path: '/produits/epee-de-test',
        title: 'Épée de test',
        type: 'product',
        productId: 'product-1',
        views: 100,
        exits: 20,
        ...overrides,
    };

    // Seule une page produit porte un `productId` : on ne garde celui du défaut que dans ce cas.
    if (page.type !== 'product' && !('productId' in overrides)) delete page.productId;

    return page;
}

export function buildPageViewRow(overrides: Partial<PageViewRow> = {}): PageViewRow {
    const { date = DEFAULT_DATE, shopId = DEFAULT_SHOP_ID, ...pageOverrides } = overrides;

    return { date, shopId, ...buildPageStat(pageOverrides) };
}

export function buildSearchTermStat(overrides: Partial<SearchTermStat> = {}): SearchTermStat {
    return {
        term: 'épée',
        hasResults: true,
        searches: 10,
        ...overrides,
    };
}

export function buildSearchRow(overrides: Partial<SearchRow> = {}): SearchRow {
    return {
        date: DEFAULT_DATE,
        shopId: DEFAULT_SHOP_ID,
        ...buildSearchTermStat(),
        ...overrides,
    };
}

export function buildAdSpendRow(overrides: Partial<AdSpendRow> = {}): AdSpendRow {
    return {
        date: DEFAULT_DATE,
        shopId: DEFAULT_SHOP_ID,
        channel: 'paid',
        spend: 50,
        clicks: 100,
        ...overrides,
    };
}

export function buildWebVitalsRow(overrides: Partial<WebVitalsRow> = {}): WebVitalsRow {
    return {
        date: DEFAULT_DATE,
        shopId: DEFAULT_SHOP_ID,
        device: 'desktop',
        samples: 100,
        lcpMs: 2000,
        inpMs: 150,
        cls: 0.05,
        loadTimeMs: 1500,
        ...overrides,
    };
}

export function buildErrorRow(overrides: Partial<ErrorRow> = {}): ErrorRow {
    return {
        date: DEFAULT_DATE,
        shopId: DEFAULT_SHOP_ID,
        type: 'not_found',
        count: 1,
        ...overrides,
    };
}

export function buildEmailRow(overrides: Partial<EmailRow> = {}): EmailRow {
    return {
        date: DEFAULT_DATE,
        shopId: DEFAULT_SHOP_ID,
        campaign: 'newsletter',
        sent: 1000,
        opens: 300,
        clicks: 50,
        ...overrides,
    };
}
