'use client';

import { Sidebar } from '@/app/components/Sidebar';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Componente interno para lidar com a lógica de autenticação
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isHydrated, isAuthenticated } = useApp();
  const router = useRouter();

  useEffect(() => {
    // Apenas redirecione se a hidratação estiver completa e o usuário não estiver autenticado
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isHydrated, router]);

  // Enquanto a hidratação não estiver completa, mostre um loader
  if (!isHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  // Se estiver hidratado mas não autenticado, retorna null para esperar o redirecionamento
  if (!isAuthenticated) {
    return null;
  }

  // Se tudo estiver OK, renderiza os filhos
  return <>{children}</>;
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="lg:pl-80">
          <div className="container mx-auto p-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
} 