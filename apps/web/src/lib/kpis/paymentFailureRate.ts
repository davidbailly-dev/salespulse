import { ErrorRow, Order } from '@salespulse/contracts';

/**
 * Taux d'échec de paiement : échecs / tentatives de paiement, en % avec 1 décimale. Une tentative
 * est soit un échec, soit une commande completed. Les paniers abandonnés n'en sont pas : le
 * visiteur est parti avant de payer, ce n'est pas un échec de paiement.
 */
export function calculatePaymentFailureRate(errors: ErrorRow[], orders: Order[]): number {
    const failedCount = errors
        .filter((row) => row.type === 'payment_failed')
        .reduce((total, row) => total + row.count, 0);
    const completedCount = orders.filter((order) => order.status === 'completed').length;

    const attempts = failedCount + completedCount;
    if (attempts === 0) return 0;

    return Math.round((failedCount / attempts) * 1000) / 10;
}
