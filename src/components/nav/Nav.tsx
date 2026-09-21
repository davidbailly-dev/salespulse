import { TrendingUp, Package, Users, Gauge } from 'lucide-react';
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
    return(
        <nav className="bg-background border-r border-r-primary-900">
            <h1 className="p-4 text-2xl">SalesPulse</h1>
            <ul className="flex flex-col">
                {navItems.map((item) => (
                    <NavLink key={item.href} href={item.href} label={item.label} icon={<item.icon />} />
                ))}
            </ul>
        </nav>
    );
}