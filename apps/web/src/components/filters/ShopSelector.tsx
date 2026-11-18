'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Check, ChevronDown, Store } from 'lucide-react';
import { useShopFilter } from '../../lib/filters/useShopFilter';
import { useShops } from '../../lib/queries/useShops';

type ShopOption = {
    // `undefined` = "Toutes les boutiques" (aucun param `shop` dans l'URL)
    id: string | undefined;
    label: string;
};

const ALL_SHOPS_OPTION: ShopOption = { id: undefined, label: 'Toutes les boutiques' };

export function ShopSelector() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const selectedShopId = useShopFilter();
    const { data: shops, isLoading, isError } = useShops();

    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const listboxId = useId();

    const options: ShopOption[] = [ALL_SHOPS_OPTION, ...(shops ?? []).map(({ id, name }) => ({ id, label: name }))];
    const selectedIndex = Math.max(options.findIndex((option) => option.id === selectedShopId), 0);

    // Un `?shop=` qui ne correspond à aucune boutique connue (lien périmé, id modifié à la main)
    // est signalé plutôt que de laisser croire que "Toutes les boutiques" est active.
    let buttonLabel = options[selectedIndex].label;
    if (isLoading) buttonLabel = 'Chargement…';
    else if (isError) buttonLabel = 'Boutiques indisponibles';
    else if (selectedShopId && !options.some((option) => option.id === selectedShopId)) buttonLabel = 'Boutique inconnue';

    // Ferme la liste au clic en dehors (mousedown plutôt que blur : Safari ne donne pas le focus
    // à un bouton au clic, le blur ne se déclencherait donc jamais) et avec la touche Echap.
    useEffect(() => {
        if (!isOpen) return;
        const onMouseDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
        };
        const onKeyDown = (event: globalThis.KeyboardEvent) => {
            if (event.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('mousedown', onMouseDown);
        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [isOpen]);

    function open() {
        setActiveIndex(selectedIndex);
        setIsOpen(true);
    }

    function selectShop(option: ShopOption) {
        // Conserve les autres filtres (plage de dates) : seul le param `shop` change.
        const params = new URLSearchParams(searchParams.toString());
        if (option.id) params.set('shop', option.id);
        else params.delete('shop');

        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
        setIsOpen(false);
    }

    // Le focus reste sur le bouton, la ligne active est signalée via aria-activedescendant
    // (pattern "listbox" WAI-ARIA).
    function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (!isOpen) return open();
            const step = event.key === 'ArrowDown' ? 1 : -1;
            setActiveIndex((index) => Math.min(Math.max(index + step, 0), options.length - 1));
        } else if (isOpen && (event.key === 'Enter' || event.key === ' ')) {
            // preventDefault évite le clic natif du bouton, qui refermerait/rouvrirait la liste
            event.preventDefault();
            selectShop(options[activeIndex]);
        } else if (event.key === 'Tab') {
            setIsOpen(false);
        }
    }

    return (
        <div ref={containerRef} className="relative min-w-0">
            <button
                type="button"
                disabled={isLoading || isError}
                onClick={() => (isOpen ? setIsOpen(false) : open())}
                onKeyDown={handleKeyDown}
                role="combobox"
                aria-label="Choisir une boutique"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={listboxId}
                aria-activedescendant={isOpen ? `${listboxId}-${activeIndex}` : undefined}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-border bg-surface transition-colors cursor-pointer hover:border-secondary-500/40 disabled:cursor-default disabled:text-gray-400"
            >
                <Store size={16} className="shrink-0 text-secondary-400" />
                <span className="truncate flex-1 text-left">{buttonLabel}</span>
                <ChevronDown
                    size={16}
                    className={`shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <ul
                    id={listboxId}
                    role="listbox"
                    aria-label="Boutiques"
                    className="absolute left-0 right-0 mt-1 z-50 py-1 rounded-lg border border-border bg-surface shadow-lg"
                >
                    {options.map((option, index) => {
                        const isSelected = index === selectedIndex && buttonLabel !== 'Boutique inconnue';
                        return (
                            <li
                                key={option.id ?? 'all'}
                                id={`${listboxId}-${index}`}
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => selectShop(option)}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${
                                    index === activeIndex ? 'bg-surface-hover' : ''
                                } ${isSelected ? 'text-secondary-400' : ''}`}
                            >
                                <span className="truncate flex-1">{option.label}</span>
                                {isSelected && <Check size={16} className="shrink-0" />}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
