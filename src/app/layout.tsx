
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { TransactionsProvider } from '@/hooks/use-transactions';
import { ContactsProvider } from '@/hooks/use-contacts';
import { VirtualCardProvider } from '@/hooks/use-virtual-card';
import { TontineProvider } from '@/hooks/use-tontine';
import { VaultsProvider } from '@/hooks/use-vaults';

export const metadata: Metadata = {
  title: 'PAYTIK Simplifié',
  description: 'Application de paiement simplifiée PAYTIK',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased h-full">
        <TransactionsProvider>
          <ContactsProvider>
            <VirtualCardProvider>
              <TontineProvider>
                <VaultsProvider>
                  {children}
                  <Toaster />
                </VaultsProvider>
              </TontineProvider>
            </VirtualCardProvider>
          </ContactsProvider>
        </TransactionsProvider>
      </body>
    </html>
  );
}
