import { faker } from '@faker-js/faker';
import type { Category, Customer, Dataset, Order, OrderLine, OrderStatus, Product, Shop } from './schemas';

const SEED = 424242;
const WINDOW_DAYS = 90;

// Volumes totaux (toutes boutiques confondues), répartis entre les boutiques selon leur `share`.
// Les ratios commandes/clients et produits/commandes restent identiques dans chaque boutique,
// donc les pondérations calibrées plus bas (clients fidèles, produits populaires) gardent leur effet.
const PRODUCT_COUNT = 180;
const CUSTOMER_COUNT = 600;
const ORDER_COUNT = 600;

// Les `id` sont des slugs fixes (et non des uuid) : ils apparaissent dans l'URL (`?shop=`),
// autant qu'ils soient lisibles et stables d'un démarrage à l'autre.
type ShopConfig = Shop & { share: number };

const SHOP_CONFIGS: ShopConfig[] = [
    { id: 'armurerie-du-nord', name: 'L\'Armurerie du Nord', share: 0.5 },
    { id: 'grimoire-errant', name: 'Le Grimoire Errant', share: 0.3 },
    { id: 'reliques-d-ombre', name: 'Les Reliques d\'Ombre', share: 0.2 },
];

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

function generateProducts(shopId: string, count: number): Product[] {
    return Array.from({ length: count }, () => {
        const category = faker.helpers.arrayElement(CATEGORIES);

        return {
            id: faker.string.uuid(),
            shopId,
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

function generateCustomers(shopId: string, count: number): Customer[] {
    return Array.from({ length: count }, () => {
        const firstName = faker.helpers.arrayElement(FANTASY_FIRST_NAMES);
        const epithet = faker.helpers.arrayElement(FANTASY_EPITHETS);

        return {
            id: faker.string.uuid(),
            shopId,
            name: `${firstName} ${epithet}`,
            email: faker.internet.email({ firstName: slugify(firstName), lastName: slugify(epithet) }),
            registeredAt: faker.date.past({ years: 2 }).toISOString(),
        };
    });
}

// Avec un tirage uniforme, le ratio commandes/clients écrase quasi tous les clients au-dessus
// de 2 commandes. La pondération seule a un plancher mathématique (~90% récurrents avec
// CUSTOMER_COUNT trop bas vis-à-vis d'ORDER_COUNT, cf. brainstorm dans CLAUDE.md) : il faut
// aussi plus de clients pour laisser de la place à de vrais acheteurs ponctuels.
const LOYAL_CUSTOMER_SHARE = 0.06;
const LOYAL_CUSTOMER_WEIGHT = 15;

function buildWeightedCustomers(customers: Customer[]): { value: Customer; weight: number }[] {
    const loyalCount = Math.round(customers.length * LOYAL_CUSTOMER_SHARE);

    return customers.map((customer, index) => ({
        value: customer,
        weight: index < loyalCount ? LOYAL_CUSTOMER_WEIGHT : 1,
    }));
}

function pickStatus(): OrderStatus {
    return faker.helpers.weightedArrayElement([
        { value: 'completed', weight: 80 },
        { value: 'abandoned', weight: 15 },
        { value: 'refunded', weight: 5 },
    ]);
}

// Sans pondération, un tirage uniforme sur le catalogue fait qu'avec le volume de
// commandes du mock, quasi tous les produits finissent vendus au moins une fois
// (couverture catalogue à 100%, concentration des ventes proche du bruit statistique).
// Une minorité de produits "populaires" (POPULAR_PRODUCT_SHARE = 20%, poids
// POPULAR_PRODUCT_WEIGHT = 10) concentre l'essentiel des ventes, même pattern que
// buildWeightedCustomers, pour laisser une vraie traîne de produits peu ou jamais vendus.
const POPULAR_PRODUCT_SHARE = 0.2;
const POPULAR_PRODUCT_WEIGHT = 15;

function buildWeightedProducts(products: Product[]): { value: Product; weight: number }[] {
    const popularCount = Math.round(products.length * POPULAR_PRODUCT_SHARE);

    return products.map((product, index) => ({
        value: product,
        weight: index < popularCount ? POPULAR_PRODUCT_WEIGHT : 1,
    }));
}

/**
 * Tirage sans remise pondéré par popularité (algorithme A-ES : chaque produit reçoit
 * une clé aléatoire élevée à la puissance 1/poids, les plus fortes clés l'emportent),
 * pour que les produits populaires reviennent plus souvent dans les lignes de commande
 * sans jamais apparaître deux fois dans la même commande.
 */
function pickWeightedProductsWithoutReplacement(
    weightedProducts: { value: Product; weight: number }[],
    count: number,
): Product[] {
    return weightedProducts
        .map(({ value, weight }) => ({ value, key: faker.number.float({ min: 0, max: 1 }) ** (1 / weight) }))
        .sort((a, b) => b.key - a.key)
        .slice(0, count)
        .map(({ value }) => value);
}

function generateLines(weightedProducts: { value: Product; weight: number }[]): OrderLine[] {
    const lineCount = faker.number.int({ min: 1, max: 4 });
    const chosenProducts = pickWeightedProductsWithoutReplacement(weightedProducts, lineCount);
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
function generateOrders(
    shopId: string,
    products: Product[],
    customers: Customer[],
    count: number,
    now: Date,
): Order[] {
    const weightedCustomers = buildWeightedCustomers(customers);
    const weightedProducts = buildWeightedProducts(products);

    return Array.from({ length: count }, () => {
        const offsetHours = faker.number.float({ min: 0, max: WINDOW_DAYS * 24 });
        const date = new Date(now.getTime() - offsetHours * 60 * 60 * 1000);
        const lines = generateLines(weightedProducts);
        const totalAmount = lines.reduce((total, line) => total + line.quantity * line.unitPrice, 0);

        return {
            id: faker.string.uuid(),
            shopId,
            customerId: faker.helpers.weightedArrayElement(weightedCustomers).id,
            date: date.toISOString(),
            status: pickStatus(),
            lines,
            totalAmount: Number(totalAmount.toFixed(2)),
        };
    });
}

/**
 * Chaque boutique a son propre catalogue, ses propres clients et ses propres commandes
 * (un client ou un produit n'appartient qu'à une boutique, comme avec un connecteur par
 * boutique dans la version production). Les commandes d'une boutique ne référencent donc
 * que ses produits et ses clients.
 */
export function generateDataset(now: Date = new Date()): Dataset {
    faker.seed(SEED);

    const shops: Shop[] = SHOP_CONFIGS.map(({ id, name }) => ({ id, name }));
    const products: Product[] = [];
    const customers: Customer[] = [];
    const orders: Order[] = [];

    for (const { id: shopId, share } of SHOP_CONFIGS) {
        const shopProducts = generateProducts(shopId, Math.round(PRODUCT_COUNT * share));
        const shopCustomers = generateCustomers(shopId, Math.round(CUSTOMER_COUNT * share));
        const shopOrders = generateOrders(shopId, shopProducts, shopCustomers, Math.round(ORDER_COUNT * share), now);

        products.push(...shopProducts);
        customers.push(...shopCustomers);
        orders.push(...shopOrders);
    }

    return { shops, products, customers, orders };
}
