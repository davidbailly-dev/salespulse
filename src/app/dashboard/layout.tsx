import { Nav } from "../../components/nav/Nav"
import { DateRangeFilter } from "../../components/filters/DateRangeFilter"

export default function DashboardLayout({children}: {children: React.ReactNode}) {
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