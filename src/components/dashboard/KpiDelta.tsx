import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import {
    calculateEvolution,
    type EvolutionDirection,
    type EvolutionMode,
    type EvolutionTone,
    type Polarity,
} from '../../lib/comparison/evolution';

type KpiDeltaProps = {
    current: number;
    // `undefined` : comparaison désactivée (rien à afficher). `null` : comparaison active mais valeur
    // N-1 indisponible.
    previous: number | null | undefined;
    polarity: Polarity;
    mode?: EvolutionMode;
};

const toneClassNames: Record<EvolutionTone, string> = {
    good: 'text-success',
    bad: 'text-danger',
    neutral: 'text-gray-400',
};

const directionIcons: Record<EvolutionDirection, typeof ArrowUp> = { up: ArrowUp, down: ArrowDown, flat: Minus };
const directionWords: Record<EvolutionDirection, string> = { up: 'en hausse', down: 'en baisse', flat: 'stable' };

const changeFormatter = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: 'exceptZero',
});

/**
 * Évolution d'un KPI par rapport à la période de comparaison. La couleur dépend de la polarité du
 * KPI (une hausse du taux de remboursement est rouge), mais ne porte jamais seule l'information :
 * flèche, signe et texte pour lecteur d'écran la doublent.
 */
export function KpiDelta({ current, previous, polarity, mode = 'relative' }: KpiDeltaProps) {
    if (previous === undefined) return null;

    const evolution = previous === null ? null : calculateEvolution(current, previous, polarity, mode);

    if (!evolution) {
        return (
            <span className="text-xs text-gray-400" title="Valeur N-1 indisponible">
                – <span className="sr-only">évolution par rapport à N-1 indisponible</span>
            </span>
        );
    }

    const Icon = directionIcons[evolution.direction];
    const unit = mode === 'points' ? ' pt' : ' %';
    const formattedChange = `${changeFormatter.format(evolution.change)}${unit}`;

    return (
        <span className={`inline-flex items-center gap-1 text-sm ${toneClassNames[evolution.tone]}`}>
            <Icon aria-hidden size={14} />
            <span aria-hidden>{formattedChange}</span>
            <span className="text-xs text-gray-400" aria-hidden>
                vs N-1
            </span>
            <span className="sr-only">
                {directionWords[evolution.direction]} de {formattedChange.replace(/^[+-]/, '')} par rapport à N-1
            </span>
        </span>
    );
}
