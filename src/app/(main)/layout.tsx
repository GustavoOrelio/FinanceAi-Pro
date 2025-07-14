'use client';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DataProvider, useData } from '@/contexts/DataContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@/app/components/Sidebar';

// Componente de guarda de rota que depende de ambos os contextos
function MainContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { isLoading: isDataLoading } = useData();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Carregando autenticação...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-80">
        <div className="container mx-auto p-8">
          {isDataLoading ? <p>Carregando dados...</p> : children}
        </div>
      </main>
    </div>
  );
}

// Layout principal que compõe os provedores
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DataProvider>
        <MainContent>{children}</MainContent>
      </DataProvider>
    </AuthProvider>
  );
} 