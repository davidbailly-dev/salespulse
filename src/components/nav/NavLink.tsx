'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

type NavLinkProps = {
    href: string;
    label: string;
    icon: ReactNode;
};

export function NavLink({ href, label, icon }: NavLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={`p-4 flex flex-row gap-4 hover:bg-primary-600 ${
                isActive ? 'bg-primary-900' : ''
            }`}
        >
            {icon}
            {label}
        </Link>
    );
}
