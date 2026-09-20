import './global.css';
import { MockServiceWorkerProvider } from '../mocks/MockServiceWorkerProvider';

export default function RootLayout({children}: {children: React.ReactNode}) {
    return(
        <html>
            <body className="min-h-screen bg-background bg-linear-to-br from-background via-background to-secondary-900/40 text-white p-4">
                <MockServiceWorkerProvider>{children}</MockServiceWorkerProvider>
            </body>
        </html>
    );
}