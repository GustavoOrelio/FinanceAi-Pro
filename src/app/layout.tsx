import { AppProvider } from '@/contexts/AppContext';
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { InstallPrompt } from '@/components/InstallPrompt';
import { Inter } from 'next/font/google';
import type { AppState } from '@/lib/types';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "FinanceAI Pro",
  description: "Controle suas finanças com inteligência",
  manifest: "/manifest.json",
  icons: {
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FinanceAI Pro",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

const initialData: AppState = {
  user: {
    id: 'user-1',
    name: 'Usuário',
    email: 'usuario@exemplo.com',
    xp: 0,
  },
  stores: [
    {
      id: 'store-1',
      name: 'Quitutes da Celinha',
      category: 'Padaria',
    },
  ],
  purchases: [
    {
      id: 'purchase-1',
      storeId: 'store-1',
      userId: 'user-1',
      amount: 15.00,
      paidAmount: 0,
      remainingAmount: 15.00,
      date: new Date().toISOString(),
      category: 'food',
      description: 'Energetico',
      status: 'pending' as const,
      payments: [],
    },
    {
      id: 'purchase-2',
      storeId: 'store-1',
      userId: 'user-1',
      amount: 25.00,
      paidAmount: 0,
      remainingAmount: 25.00,
      date: new Date().toISOString(),
      category: 'food',
      description: 'Energetico 1. Pastel',
      status: 'pending' as const,
      payments: [],
    },
    {
      id: 'purchase-3',
      storeId: 'store-1',
      userId: 'user-1',
      amount: 50.00,
      paidAmount: 0,
      remainingAmount: 50.00,
      date: new Date().toISOString(),
      category: 'food',
      description: '2 Pasteis 4 Energeticos',
      status: 'pending' as const,
      payments: [],
    },
  ],
  goals: [],
  darkMode: false,
  monthlyLimit: 1000,
  isAuthenticated: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-background font-sans antialiased">
        <AppProvider initialData={initialData}>
          {children}
          <Toaster richColors closeButton position="top-right" />
          <InstallPrompt />
        </AppProvider>
      </body>
    </html>
  );
}