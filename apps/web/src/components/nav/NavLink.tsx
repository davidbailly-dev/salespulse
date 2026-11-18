'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';

type NavLinkProps = {
    href: string;
    label: string;
    icon: ReactNode;
    onClick?: () => void;
};

export function NavLink({ href, label, icon, onClick }: NavLinkProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isActive = pathname === href;

    // Propage le filtre de dates courant (query params) d'une page du dashboard à l'autre.
    const query = searchParams.toString();
    const targetHref = query ? `${href}?${query}` : href;

    return (
        <Link
            href={targetHref}
            aria-current={isActive ? 'page' : undefined}
            onClick={onClick}
            className={`p-4 flex flex-row gap-4 hover:bg-primary-600 ${
                isActive ? 'bg-linear-to-r from-primary-900 to-70% to-primary-600' : ''
            }`}
        >
            {icon}
            {label}
        </Link>
    );
}
