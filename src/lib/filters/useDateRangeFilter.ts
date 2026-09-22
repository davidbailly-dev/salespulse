'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import type { OrderDateRange } from '../queries/useOrders';
import { DATE_RANGE_PRESETS, DEFAULT_PRESET, resolvePresetRange, type DateRangePresetId } from './dateRangePresets';

const PRESET_IDS: DateRangePresetId[] = DATE_RANGE_PRESETS.map((preset) => preset.id);

function isValidPreset(value: string | null): value is DateRangePresetId {
    return PRESET_IDS.includes(value as DateRangePresetId);
}

export function useDateRangeFilter(): OrderDateRange {
    const searchParams = useSearchParams();
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const preset = searchParams.get('preset');

    // `resolvePresetRange` s'appuie sur `new Date()` : sans ce useMemo, elle serait ré-évaluée
    // à chaque rendu avec une borne `to` légèrement différente à chaque fois, ce qui change la
    // queryKey de useOrders() et redéclenche un fetch en boucle (re-render -> nouvelle plage ->
    // nouveau fetch -> re-render...). On ne la recalcule que quand les params d'URL changent.
    return useMemo(() => {
        if (from && to) return { from, to };
        return resolvePresetRange(isValidPreset(preset) ? preset : DEFAULT_PRESET);
    }, [from, to, preset]);
}
