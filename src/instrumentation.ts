export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { getDataset } = await import('./lib/mock-data/store');
        const { shops, orders, products, customers } = getDataset();
        console.log(
            `[mock-data] jeu de données généré : ${shops.length} boutiques, ${products.length} produits, ${customers.length} clients, ${orders.length} commandes`,
        );
    }
}
