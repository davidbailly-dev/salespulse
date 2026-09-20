import './global.css';

export default function RootLayout({children}: {children: React.ReactNode}) {
    return(
        <html>
            <body className="h-screen bg-linear-to-br from-stone-950 to-blue-950 text-white p-4">
                {children}
            </body>
        </html>
    );
}