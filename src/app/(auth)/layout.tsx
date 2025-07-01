export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <div className="w-full max-w-md px-4 py-8">
        {children}
      </div>
    </div>
  );
} 