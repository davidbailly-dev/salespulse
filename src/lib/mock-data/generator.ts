import { faker } from '@faker-js/faker';
import type { Category, Customer, Dataset, Order, OrderLine, OrderStatus, Product } from './schemas';

const SEED = 424242;
const PRODUCT_COUNT = 30;
const CUSTOMER_COUNT = 120;
const ORDER_COUNT = 600;
const WINDOW_DAYS = 90;

const CATEGORIES: Category[] = ['Clothing', 'Shoes', 'Accessories', 'Electronics', 'Home'];

function generateProducts(): Product[] {
    return Array.from({ length: PRODUCT_COUNT }, () => ({
        id: faker.string.uuid(),
        name: faker.commerce.productName(),
        category: faker.helpers.arrayElement(CATEGORIES),
        price: Number(faker.commerce.price({ min: 10, max: 300 })),
    }));
}

function generateCustomers(): Customer[] {
    return Array.from({ length: CUSTOMER_COUNT }, () => ({
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        registeredAt: faker.date.past({ years: 2 }).toISOString(),
    }));
}

function pickStatus(): OrderStatus {
    return faker.helpers.weightedArrayElement([
        { value: 'completed', weight: 80 },
        { value: 'abandoned', weight: 15 },
        { value: 'refunded', weight: 5 },
    ]);
}

function generateLines(products: Product[]): OrderLine[] {
    const lineCount = faker.number.int({ min: 1, max: 4 });
    const chosenProducts = faker.helpers.arrayElements(products, lineCount);
    return chosenProducts.map((product) => ({
        productId: product.id,
        quantity: faker.number.int({ min: 1, max: 3 }),
        unitPrice: product.price,
    }));
}

/**
 * Les dates sont calculées comme un décalage (heures) par rapport à `now`, fourni
 * par l'appelant. La seed fige donc la distribution des décalages, mais pas les
 * dates absolues : à chaque démarrage du serveur, les commandes se recalent
 * automatiquement sur une fenêtre glissante des `WINDOW_DAYS` derniers jours.
 */
function generateOrders(products: Product[], customers: Customer[], now: Date): Order[] {
    return Array.from({ length: ORDER_COUNT }, () => {
        const offsetHours = faker.number.float({ min: 0, max: WINDOW_DAYS * 24 });
        const date = new Date(now.getTime() - offsetHours * 60 * 60 * 1000);
        const lines = generateLines(products);
        const totalAmount = lines.reduce((total, line) => total + line.quantity * line.unitPrice, 0);

        return {
            id: faker.string.uuid(),
            customerId: faker.helpers.arrayElement(customers).id,
            date: date.toISOString(),
            status: pickStatus(),
            lines,
            totalAmount: Number(totalAmount.toFixed(2)),
        };
    });
}

export function generateDataset(now: Date = new Date()): Dataset {
    faker.seed(SEED);

    const products = generateProducts();
    const customers = generateCustomers();
    const orders = generateOrders(products, customers, now);

    return { products, customers, orders };
}
