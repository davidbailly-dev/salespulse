import { faker } from '@faker-js/faker';
import type { Category, Customer, Dataset, Order, OrderLine, OrderStatus, Product } from './schemas';

const SEED = 424242;
const PRODUCT_COUNT = 30;
const CUSTOMER_COUNT = 120;
const ORDER_COUNT = 600;
const WINDOW_DAYS = 90;

const CATEGORIES: Category[] = ['Armes', 'Armures', 'Potions', 'Grimoires', 'Artefacts'];

// Faker n'a pas de module "heroic fantasy" : les noms de produits sont composés
// à la main (un item par catégorie + un qualificatif), pas générés par Faker.
const ITEM_NAMES_BY_CATEGORY: Record<Category, string[]> = {
    Armes: ['Épée longue', 'Dague', 'Hache de guerre', 'Arc long', 'Masse d\'armes', 'Lance', 'Marteau de guerre', 'Rapière', 'Hallebarde', 'Katana'],
    Armures: ['Plastron', 'Casque', 'Bouclier', 'Gantelets', 'Jambières', 'Heaume', 'Bottes de plates', 'Cotte de mailles', 'Cape', 'Brassards'],
    Potions: ['Potion de soin', 'Potion de mana', 'Élixir de force', 'Philtre d\'invisibilité', 'Fiole de poison', 'Décoction de résistance', 'Élixir de vitesse', 'Potion de régénération'],
    Grimoires: ['Grimoire des flammes', 'Tome des ombres', 'Manuel de nécromancie', 'Codex runique', 'Parchemin ancien', 'Livre des sortilèges', 'Traité d\'alchimie', 'Recueil des Anciens'],
    Artefacts: ['Amulette runique', 'Anneau de pouvoir', 'Orbe de cristal', 'Talisman protecteur', 'Sceptre ancien', 'Médaillon enchanté', 'Couronne oubliée', 'Relique sacrée'],
};

const ITEM_QUALIFIERS = ['du Dragon', 'des Ombres', 'de l\'Aube', 'légendaire', 'enchanté', 'de l\'Éternité', 'maudit', 'runique', 'des Anciens', 'de Cristal', 'de Givre', 'du Néant'];

function generateProductName(category: Category): string {
    const item = faker.helpers.arrayElement(ITEM_NAMES_BY_CATEGORY[category]);
    const qualifier = faker.helpers.arrayElement(ITEM_QUALIFIERS);
    return `${item} ${qualifier}`;
}

function generateProducts(): Product[] {
    return Array.from({ length: PRODUCT_COUNT }, () => {
        const category = faker.helpers.arrayElement(CATEGORIES);

        return {
            id: faker.string.uuid(),
            name: generateProductName(category),
            category,
            price: Number(faker.commerce.price({ min: 10, max: 300 })),
        };
    });
}

// Personnages plutôt que clients réels (boutique MMORPG) : prénom + épithète tirés
// de listes dédiées, l'email est dérivé des mêmes tokens (accents retirés) pour
// rester cohérent avec le nom plutôt que de générer un email sans rapport.
const FANTASY_FIRST_NAMES = ['Thoradin', 'Elyndra', 'Kael', 'Sylvara', 'Grimbald', 'Aurelia', 'Thrain', 'Nyssa', 'Draven', 'Isolde', 'Varic', 'Lyra', 'Borin', 'Seraphine', 'Malgrim', 'Freya', 'Corvin', 'Elowen', 'Ragnar', 'Ombeline'];
const FANTASY_EPITHETS = ['Brise-Lame', 'Cœur-de-Dragon', 'Nuit-d\'Argent', 'l\'Ombrage', 'Sans-Peur', 'des Cimes', 'Flamme-Ardente', 'le Rôdeur', 'Sang-Froid', 'des Brumes'];

function slugify(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-zA-Z]/g, '');
}

function generateCustomers(): Customer[] {
    return Array.from({ length: CUSTOMER_COUNT }, () => {
        const firstName = faker.helpers.arrayElement(FANTASY_FIRST_NAMES);
        const epithet = faker.helpers.arrayElement(FANTASY_EPITHETS);

        return {
            id: faker.string.uuid(),
            name: `${firstName} ${epithet}`,
            email: faker.internet.email({ firstName: slugify(firstName), lastName: slugify(epithet) }),
            registeredAt: faker.date.past({ years: 2 }).toISOString(),
        };
    });
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
