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
// Le genre de chaque item est renseigné pour accorder le qualificatif (ex. "enchantée"
// vs "enchanté") plutôt que d'avoir un texte grammaticalement faux une fois sur deux.
type GenderedItem = { name: string; gender: 'm' | 'f' };

const ITEM_NAMES_BY_CATEGORY: Record<Category, GenderedItem[]> = {
    Armes: [
        { name: 'Épée longue', gender: 'f' },
        { name: 'Dague', gender: 'f' },
        { name: 'Hache de guerre', gender: 'f' },
        { name: 'Arc long', gender: 'm' },
        { name: 'Masse d\'armes', gender: 'f' },
        { name: 'Lance', gender: 'f' },
        { name: 'Marteau de guerre', gender: 'm' },
        { name: 'Rapière', gender: 'f' },
        { name: 'Hallebarde', gender: 'f' },
        { name: 'Katana', gender: 'm' },
    ],
    Armures: [
        { name: 'Plastron', gender: 'm' },
        { name: 'Casque', gender: 'm' },
        { name: 'Bouclier', gender: 'm' },
        { name: 'Gantelets', gender: 'm' },
        { name: 'Jambières', gender: 'f' },
        { name: 'Heaume', gender: 'm' },
        { name: 'Bottes de plates', gender: 'f' },
        { name: 'Cotte de mailles', gender: 'f' },
        { name: 'Cape', gender: 'f' },
        { name: 'Brassards', gender: 'm' },
    ],
    Potions: [
        { name: 'Potion de soin', gender: 'f' },
        { name: 'Potion de mana', gender: 'f' },
        { name: 'Élixir de force', gender: 'm' },
        { name: 'Philtre d\'invisibilité', gender: 'm' },
        { name: 'Fiole de poison', gender: 'f' },
        { name: 'Décoction de résistance', gender: 'f' },
        { name: 'Élixir de vitesse', gender: 'm' },
        { name: 'Potion de régénération', gender: 'f' },
    ],
    Grimoires: [
        { name: 'Grimoire des flammes', gender: 'm' },
        { name: 'Tome des ombres', gender: 'm' },
        { name: 'Manuel de nécromancie', gender: 'm' },
        { name: 'Codex runique', gender: 'm' },
        { name: 'Parchemin ancien', gender: 'm' },
        { name: 'Livre des sortilèges', gender: 'm' },
        { name: 'Traité d\'alchimie', gender: 'm' },
        { name: 'Recueil des Anciens', gender: 'm' },
    ],
    Artefacts: [
        { name: 'Amulette runique', gender: 'f' },
        { name: 'Anneau de pouvoir', gender: 'm' },
        { name: 'Orbe de cristal', gender: 'f' },
        { name: 'Talisman protecteur', gender: 'm' },
        { name: 'Sceptre ancien', gender: 'm' },
        { name: 'Médaillon enchanté', gender: 'm' },
        { name: 'Couronne oubliée', gender: 'f' },
        { name: 'Relique sacrée', gender: 'f' },
    ],
};

// La plupart des qualificatifs sont des compléments invariables ("du Dragon", "runique"...) ;
// seuls les vrais adjectifs (enchanté/maudit) ont une forme féminine différente.
type Qualifier = { m: string; f: string };

const ITEM_QUALIFIERS: Qualifier[] = [
    { m: 'du Dragon', f: 'du Dragon' },
    { m: 'des Ombres', f: 'des Ombres' },
    { m: 'de l\'Aube', f: 'de l\'Aube' },
    { m: 'légendaire', f: 'légendaire' },
    { m: 'enchanté', f: 'enchantée' },
    { m: 'de l\'Éternité', f: 'de l\'Éternité' },
    { m: 'maudit', f: 'maudite' },
    { m: 'runique', f: 'runique' },
    { m: 'des Anciens', f: 'des Anciens' },
    { m: 'de Cristal', f: 'de Cristal' },
    { m: 'de Givre', f: 'de Givre' },
    { m: 'du Néant', f: 'du Néant' },
];

function generateProductName(category: Category): string {
    const item = faker.helpers.arrayElement(ITEM_NAMES_BY_CATEGORY[category]);
    const qualifier = faker.helpers.arrayElement(ITEM_QUALIFIERS);
    return `${item.name} ${item.gender === 'f' ? qualifier.f : qualifier.m}`;
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
