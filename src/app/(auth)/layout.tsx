// src/app/(auth)/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
        <div className="w-full max-w-md px-4 py-8">
          {children}
        </div>
      </div>
    </AuthProvider>
  );
} 