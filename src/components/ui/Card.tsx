export function Card({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-4 rounded-2xl p-4 bg-surface hover:bg-surface-hover border border-border hover:border-secondary-500/40 transition-colors">
            {children}
        </div>
    );
}

export function CardTitle({ children }: { children: React.ReactNode }) {
    return (
        <h3 className="text-2xl">{children}</h3>
    );
}

export function CardContent({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-center h-full">{children}</div>
    );
}

export function CardGroup({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-col gap-4">{children}</div>
    );
}

export function CardGroupTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-2xl border-l-4 border-secondary-500 pl-3">{children}</h2>
    );
}

export function CardGroupContent({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-4 gap-4">{children}</div>
    );
}