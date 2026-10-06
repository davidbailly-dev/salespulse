import { subtractOneYear } from '../dates/subtractOneYear';
import type { OrderDateRange } from '../queries/useOrders';

// Seul mode pour l'instant : la même période un an plus tôt (N-1). La signature prend un mode pour
// ajouter plus tard la "période précédente" (même durée, juste avant) sans toucher aux appelants.
export type ComparisonMode = 'yoy';

export const COMPARISON_MODES: { id: ComparisonMode; label: string }[] = [{ id: 'yoy', label: 'N-1' }];

export function isValidComparisonMode(value: string | null): value is ComparisonMode {
    return COMPARISON_MODES.some((mode) => mode.id === value);
}

/**
 * Plage à laquelle on compare la plage courante. Pour `yoy`, les deux bornes reculent d'un an
 * calendaire (voir `subtractOneYear`) : "30 derniers jours" devient les 30 jours équivalents de
 * l'an dernier, et un mois (en cours ou dernier) devient le même mois de l'an dernier.
 */
export function resolveComparisonRange(range: OrderDateRange, mode: ComparisonMode): OrderDateRange {
    switch (mode) {
        case 'yoy':
            return {
                from: range.from ? subtractOneYear(new Date(range.from)).toISOString() : undefined,
                to: range.to ? subtractOneYear(new Date(range.to)).toISOString() : undefined,
            };
    }
}
