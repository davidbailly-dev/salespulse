export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { getDataset, getAnalyticsDataset } = await import('./lib/mock-data/store');
        const { shops, orders, products, customers } = getDataset();
        const { traffic, pageViews, searches, adSpend, webVitals, errors, emails } = getAnalyticsDataset();
        console.log(
            `[mock-data] jeu de données généré : ${shops.length} boutiques, ${products.length} produits, ${customers.length} clients, ${orders.length} commandes (fenêtres actuelle et N-1)`,
        );
        console.log(
            `[mock-data] analytics généré : ${traffic.length} lignes de trafic, ${pageViews.length} lignes de pages vues, ${searches.length} lignes de recherches, ${adSpend.length} lignes de dépenses publicitaires, ${webVitals.length} lignes de Core Web Vitals, ${errors.length} lignes d'erreurs, ${emails.length} lignes d'e-mails`,
        );
    }
}
