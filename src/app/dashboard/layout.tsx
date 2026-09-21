import { Nav } from "../../components/nav/Nav"

export default function DashboardLayout({children}: {children: React.ReactNode}) {
 return (
    <div className="grid grid-cols-[auto_1fr] gap-8">
        <Nav />
        <main className="p-8">{children}</main>
    </div>
 )
}