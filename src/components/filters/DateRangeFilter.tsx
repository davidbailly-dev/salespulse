'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DATE_RANGE_PRESETS, DEFAULT_PRESET, isValidPreset, type DateRangePresetId } from '../../lib/filters/dateRangePresets';

function toDateInputValue(iso: string): string {
    return iso.slice(0, 10);
}

type CustomRangeInputsProps = {
    from: string | null;
    to: string | null;
    isActive: boolean;
    onApply: (from: string, to: string) => void;
};

// Remontée via la `key={from}-${to}` du parent à chaque changement d'URL externe
// (préréglage, navigation) : l'état local repart alors de la valeur affichée par l'URL,
// sans passer par un effect qui recopierait une prop dans un state.
function CustomRangeInputs({ from, to, isActive, onApply }: CustomRangeInputsProps) {
    const [draftFrom, setDraftFrom] = useState(from ? toDateInputValue(from) : '');
    const [draftTo, setDraftTo] = useState(to ? toDateInputValue(to) : '');

    function handleChange(nextFrom: string, nextTo: string) {
        setDraftFrom(nextFrom);
        setDraftTo(nextTo);
        if (nextFrom && nextTo) onApply(nextFrom, nextTo);
    }

    return (
        <div className="flex items-center gap-2">
            <input
                type="date"
                value={draftFrom}
                onChange={(event) => handleChange(event.target.value, draftTo)}
                className={`px-2 py-1 text-sm rounded-lg border bg-transparent ${
                    isActive ? 'border-secondary-500' : 'border-border'
                }`}
            />
            <span className="text-gray-400 text-sm">→</span>
            <input
                type="date"
                value={draftTo}
                onChange={(event) => handleChange(draftFrom, event.target.value)}
                className={`px-2 py-1 text-sm rounded-lg border bg-transparent ${
                    isActive ? 'border-secondary-500' : 'border-border'
                }`}
            />
        </div>
    );
}

export function DateRangeFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const isCustom = Boolean(from && to);
    const presetParam = searchParams.get('preset');
    // Même règle que useDateRangeFilter() : sans param (ou avec un preset inconnu), c'est le preset
    // par défaut qui s'applique aux données, donc c'est lui qui doit apparaître sélectionné.
    const activePreset = isCustom ? null : isValidPreset(presetParam) ? presetParam : DEFAULT_PRESET;

    // Repart des params courants (ex. `shop`) et ne remplace que la plage de dates.
    function buildParamsWithoutDateRange(): URLSearchParams {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('preset');
        params.delete('from');
        params.delete('to');
        return params;
    }

    function applyPreset(presetId: DateRangePresetId) {
        const params = buildParamsWithoutDateRange();
        params.set('preset', presetId);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }

    function applyCustomRange(nextFrom: string, nextTo: string) {
        const params = buildParamsWithoutDateRange();
        params.set('from', `${nextFrom}T00:00:00.000Z`);
        // Borne de fin poussée à la fin de journée pour inclure les commandes du dernier jour sélectionné.
        params.set('to', `${nextTo}T23:59:59.999Z`);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {DATE_RANGE_PRESETS.map(({ id, label }) => (
                <button
                    key={id}
                    type="button"
                    onClick={() => applyPreset(id)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors cursor-pointer ${
                        activePreset === id
                            ? 'bg-secondary-500 border-secondary-500 text-white'
                            : 'border-border text-gray-400 hover:border-secondary-500/40'
                    }`}
                >
                    {label}
                </button>
            ))}
            <CustomRangeInputs
                key={`${from}-${to}`}
                from={from}
                to={to}
                isActive={isCustom}
                onApply={applyCustomRange}
            />
        </div>
    );
}
