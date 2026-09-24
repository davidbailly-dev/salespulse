'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { TrendingUp, Package, Users, Gauge, Menu, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink } from './NavLink';

type NavItemProps = {
    label: string,
    href: string,
    icon: LucideIcon
}

const navItems: NavItemProps[] = [
    {
        label : 'Tableau de bord',
        href: '/dashboard',
        icon: Gauge
    },
    {
        label : 'Ventes',
        href: '/dashboard/sales',
        icon: TrendingUp
    },
    {
        label : 'Produits',
        href: '/dashboard/products',
        icon: Package
    },
    {
        label : 'Clients',
        href: '/dashboard/customers',
        icon: Users
    },
];

export function Nav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const [previousPathname, setPreviousPathname] = useState(pathname);

    // Referme le menu mobile a chaque changement de page (pattern "adjusting state
    // during render" de React, pour eviter un setState synchrone dans un effet)
    if (pathname !== previousPathname) {
        setPreviousPathname(pathname);
        setIsOpen(false);
    }

    // Permet de fermer le menu mobile avec la touche Echap
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen]);

    return (
        <>
            <div className="md:hidden flex items-center justify-between p-4 bg-background border-b border-primary-900 sticky top-0 z-30">
                <span className="text-xl">SalesPulse</span>
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    aria-label="Ouvrir le menu"
                    aria-expanded={isOpen}
                    className="p-2 -mr-2 cursor-pointer"
                >
                    <Menu />
                </button>
            </div>

            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            <nav
                className={`bg-background border-r border-r-primary-900 h-screen flex flex-col fixed top-0 left-0 z-50 w-64 transition-transform duration-200 ease-in-out md:translate-x-0 md:sticky md:z-auto md:w-auto ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between p-4">
                    <h1 className="text-2xl">SalesPulse</h1>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        aria-label="Fermer le menu"
                        className="md:hidden p-2 cursor-pointer"
                    >
                        <X />
                    </button>
                </div>
                <ul className="flex flex-col">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.href}
                            href={item.href}
                            label={item.label}
                            icon={<item.icon />}
                            onClick={() => setIsOpen(false)}
                        />
                    ))}
                </ul>
                <div className="mt-auto p-4">
                    <div className="border-t border-primary-900 mx-4 pt-4 text-sm text-gray-400">
                        David Bailly
                    </div>
                </div>
            </nav>
        </>
    );
}
