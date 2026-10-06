'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { resolveComparisonRange } from '../../lib/filters/comparisonRange';
import { useComparisonMode } from '../../lib/filters/useComparisonRange';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';

// Dates affichées en UTC, comme les plages (bornes en ISO UTC), pour ne pas décaler d'un jour.
const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

function formatRange(range: { from?: string; to?: string }): string {
    if (!range.from || !range.to) return '';

    return `${dateFormatter.format(new Date(range.from))} – ${dateFormatter.format(new Date(range.to))}`;
}

export function ComparisonToggle() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const mode = useComparisonMode();
    const dateRange = useDateRangeFilter();
    const isActive = mode !== undefined;

    function toggle() {
        // Repart des params courants (période, boutique) et ne touche qu'à `compare`.
        const params = new URLSearchParams(searchParams.toString());
        if (isActive) params.delete('compare');
        else params.set('compare', 'yoy');

        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }

    return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={toggle}
                className="flex items-center gap-2 text-sm cursor-pointer"
            >
                <span
                    aria-hidden
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors ${
                        isActive ? 'bg-secondary-500 border-secondary-500' : 'bg-surface border-border'
                    }`}
                >
                    <span
                        className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                            isActive ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`}
                    />
                </span>
                <span className={isActive ? 'text-white' : 'text-gray-400'}>Comparer à N-1</span>
            </button>
            {isActive && (
                <span className="text-xs text-gray-400">
                    {formatRange(resolveComparisonRange(dateRange, mode))}
                </span>
            )}
        </div>
    );
}
