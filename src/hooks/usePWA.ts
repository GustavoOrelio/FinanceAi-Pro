"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAHook {
  isInstallable: boolean;
  isInstalled: boolean;
  installPWA: () => Promise<void>;
}

export function usePWA(): PWAHook {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verifica se o app já está instalado
    const checkInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true);
      }
    };

    checkInstalled();

    // Monitora mudanças no modo de exibição
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    mediaQuery.addListener(checkInstalled);

    // Captura o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Monitora quando o app é instalado
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      mediaQuery.removeListener(checkInstalled);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
      }
    } catch (error) {
      console.error("Erro ao instalar o PWA:", error);
    } finally {
      setDeferredPrompt(null);
    }
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    installPWA,
  };
}
