import { DomainError } from '../../shared/domain/domainError';

// Statut canonique d'une commande, sur un seul axe orienté paiement (jalon 010, D6). Le
// remboursement n'est pas un statut et l'expédition n'est pas modélisée. La traduction du statut
// brut de chaque plateforme appartient à son connecteur (D44 à D46).
// Figée : `readonly` ne protège qu'à la compilation, et orderStatus() valide contre cette liste.
export const ORDER_STATUSES = Object.freeze(['pending', 'paid', 'failed', 'cancelled'] as const);

// Union de littéraux, sans marque : le compilateur refuse déjà toute autre chaîne.
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// Valide une chaîne venue de l'extérieur du domaine (base de données, adapter).
export function orderStatus(value: string): OrderStatus {
    if (!isOrderStatus(value)) {
        throw new DomainError('invalid-order-status', `Statut de commande inconnu : « ${value} ».`);
    }
    return value;
}

// Seules les commandes payées comptent dans les indicateurs (D7).
export function countsInIndicators(status: OrderStatus): boolean {
    return status === 'paid';
}

function isOrderStatus(value: string): value is OrderStatus {
    return (ORDER_STATUSES as readonly string[]).includes(value);
}
