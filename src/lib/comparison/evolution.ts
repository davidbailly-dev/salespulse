// Polarité d'un KPI : une hausse est-elle une bonne nouvelle ? `neutral` pour un KPI sans sens
// clair (ex. part de nouveaux visiteurs), dont l'évolution s'affiche toujours en gris.
export type Polarity = 'higher-is-better' | 'lower-is-better' | 'neutral';

// `relative` : variation en % de la valeur précédente, pour les montants et les volumes.
// `points` : écart absolu en points, pour les KPIs qui sont déjà des taux (2,1 % -> 2,4 % = +0,3 pt,
// et non +14 %, qui prêterait à confusion).
export type EvolutionMode = 'relative' | 'points';

export type EvolutionDirection = 'up' | 'down' | 'flat';
export type EvolutionTone = 'good' | 'bad' | 'neutral';

export type Evolution = {
    // En % (mode relatif) ou en points (mode points), arrondi à une décimale.
    change: number;
    direction: EvolutionDirection;
    tone: EvolutionTone;
};

// Sous ces seuils, la variation est considérée comme nulle (gris) : elle ne mérite ni vert ni rouge.
// Ils s'appliquent à la valeur affichée (arrondie à une décimale), pas au flottant brut : sinon un
// même "+0,1 pt" affiché serait gris ou vert selon les valeurs (0,3 - 0,2 = 0,0999…98).
export const NEGLIGIBLE_RELATIVE_CHANGE = 0.5;
export const NEGLIGIBLE_POINTS_CHANGE = 0.1;

// Arrondi symétrique : `Math.round` arrondit les ,5 vers +∞ (-1,25 -> -1,2 mais +1,25 -> +1,3), on
// arrondit donc la valeur absolue. Le `|| 0` évite un -0 (affiché "-0,0") pour une baisse infime.
function roundToOneDecimal(value: number): number {
    return (Math.sign(value) * Math.round(Math.abs(value) * 10)) / 10 || 0;
}

/**
 * Évolution de `current` par rapport à `previous`. `null` quand elle n'est pas calculable : en
 * mode relatif, une valeur précédente nulle ferait diviser par zéro.
 */
export function calculateEvolution(
    current: number,
    previous: number,
    polarity: Polarity,
    mode: EvolutionMode = 'relative',
): Evolution | null {
    let change: number;
    if (mode === 'points') {
        change = current - previous;
    } else {
        if (previous === 0) return null;
        change = ((current - previous) / Math.abs(previous)) * 100;
    }

    const roundedChange = roundToOneDecimal(change);
    const threshold = mode === 'points' ? NEGLIGIBLE_POINTS_CHANGE : NEGLIGIBLE_RELATIVE_CHANGE;
    const direction: EvolutionDirection =
        Math.abs(roundedChange) < threshold ? 'flat' : roundedChange > 0 ? 'up' : 'down';

    if (direction === 'flat' || polarity === 'neutral') return { change: roundedChange, direction, tone: 'neutral' };

    const isImprovement = (direction === 'up') === (polarity === 'higher-is-better');

    return { change: roundedChange, direction, tone: isImprovement ? 'good' : 'bad' };
}
