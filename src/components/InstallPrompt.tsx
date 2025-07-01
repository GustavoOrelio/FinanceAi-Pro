'use client';

import { useState } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, X } from 'lucide-react';

export function InstallPrompt() {
  const { isInstallable, isInstalled, installPWA } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isInstallable || isInstalled || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[400px] z-50">
      <Card className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold mb-1">
              Instale o FinanceAI Pro
            </h3>
            <p className="text-sm text-muted-foreground">
              Instale nosso app para uma experiência melhor e acesso offline.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 -mt-2 -mr-2"
            onClick={() => setIsDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            variant="default"
            className="flex-1"
            onClick={installPWA}
          >
            <Download className="mr-2 h-4 w-4" />
            Instalar App
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsDismissed(true)}
          >
            Agora não
          </Button>
        </div>
      </Card>
    </div>
  );
} 