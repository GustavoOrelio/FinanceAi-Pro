import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Relatórios | FinanceAI Pro',
  description: 'Relatórios detalhados e análises avançadas dos seus gastos.',
};

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {children}
    </div>
  );
} 