'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { useMemo } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import {
  Home,
  Store,
  LineChart,
  Target,
  Bot,
  Camera,
  SmilePlus,
  Bell,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, label, isActive, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${isActive ? 'bg-accent' : ''
        }`}
      onClick={onClick}
    >
      {icon}
      {label}
    </Link>
  );
}

function SidebarContent({ onNavItemClick }: { onNavItemClick?: () => void }) {
  const pathname = usePathname();
  const { user, logout, isHydrated } = useApp();

  if (!user || !isHydrated) return null;

  const navItems = useMemo(() => [
    { href: '/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { href: '/stores', icon: <Store size={20} />, label: 'Lojas' },
    { href: '/analytics', icon: <LineChart size={20} />, label: 'Análises' },
    { href: '/goals', icon: <Target size={20} />, label: 'Metas' },
    { href: '/ai-assistant', icon: <Bot size={20} />, label: 'Assistente AI' },
    { href: '/price-scanner', icon: <Camera size={20} />, label: 'Scanner de Preços' },
    { href: '/mood-tracker', icon: <SmilePlus size={20} />, label: 'Humor' },
    { href: '/notifications', icon: <Bell size={20} />, label: 'Notificações' },
    { href: '/settings', icon: <Settings size={20} />, label: 'Configurações' },
  ], []);

  const handleLogout = () => {
    logout();
  };

  // Calcula o nível e XP do usuário
  const xp = Number(user.xp) || 0;
  const xpPerLevel = 100;
  const currentLevel = Math.floor(xp / xpPerLevel);
  const xpInCurrentLevel = xp % xpPerLevel;
  const xpToNextLevel = xpPerLevel - xpInCurrentLevel;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Perfil do Usuário */}
      <div className="flex flex-col items-center gap-4 p-6 border-b">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-lg font-semibold">{user.name}</h2>
          <p className="text-sm text-muted-foreground">Nível {currentLevel}</p>
        </div>
        <div className="w-full space-y-1">
          <div className="flex justify-between text-xs">
            <span>XP {xpInCurrentLevel}</span>
            <span>+{xpToNextLevel} para o próximo nível</span>
          </div>
          <Progress
            value={(xpInCurrentLevel / xpPerLevel) * 100}
            className="h-2"
          />
        </div>
      </div>

      {/* Navegação */}
      <div className="flex-1 px-3">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              isActive={pathname === item.href}
              onClick={onNavItemClick}
            />
          ))}
        </nav>
      </div>

      {/* Botão de Logout */}
      <div className="p-3 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          Sair
        </Button>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <>
      {/* Sidebar para Desktop */}
      <aside className="fixed hidden h-screen w-80 border-r bg-background lg:block">
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile (Sheet) */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed left-4 top-4 z-40"
          >
            <Menu size={24} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <SidebarContent onNavItemClick={() => document.body.click()} />
        </SheetContent>
      </Sheet>
    </>
  );
} 