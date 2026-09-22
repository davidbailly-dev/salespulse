import { connection } from "next/server"
import { Nav } from "../../components/nav/Nav"
import { DateRangeFilter } from "../../components/filters/DateRangeFilter"

export default async function DashboardLayout({children}: {children: React.ReactNode}) {
 // Le filtre de dates (useSearchParams) rend tout le dashboard dependant de la requete
 // entrante : on l'exclut explicitement du pre-rendu statique plutot que de multiplier
 // les Suspense autour de chaque composant qui lit l'URL (Nav, DateRangeFilter, KPIs).
 await connection()
 return (
    <div className="grid grid-cols-[auto_1fr] gap-8">
        <Nav />
        <main className="p-8 space-y-8">
            <div className="flex justify-end">
                <DateRangeFilter />
            </div>
            {children}
        </main>
    </div>
 )
}