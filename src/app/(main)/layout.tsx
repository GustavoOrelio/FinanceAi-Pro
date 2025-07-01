'use client';

import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@/app/components/Sidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const app = useApp();
  const router = useRouter();

  // Redireciona para login se não estiver autenticado
  useEffect(() => {
    if (!app.isAuthenticated) {
      router.push('/login');
    }
  }, [app.isAuthenticated, router]);

  // Não renderiza nada enquanto verifica autenticação
  if (!app.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-80">
        <div className="container mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
} 