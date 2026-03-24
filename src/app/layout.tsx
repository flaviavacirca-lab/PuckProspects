import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import Providers from '@/components/layout/Providers';

export const metadata: Metadata = {
  title: 'PuckProspects — NHL Prospect Analytics',
  description: 'Cross-league NHL prospect analytics, scouting, and player evaluation platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <TopBar />
              <main className="flex-1 overflow-y-auto px-8 py-6 bg-gray-50/80">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
