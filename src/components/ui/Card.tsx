export function Card({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-4 rounded-2xl p-4 bg-linear-to-br from-violet-500/5 to-violet-500/25 border border-violet-500/25">
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
        <h2 className="text-2xl">{children}</h2>
    );
}

export function CardGroupContent({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-4 gap-4">{children}</div>
    );
}