"use client";

import { useState, useEffect } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Estado para armazenar o valor
  // Passa uma função para useState para que seja executada apenas uma vez
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Verifica se está no ambiente do navegador
      if (typeof window === "undefined") {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return initialValue;
    }
  });

  // Retorna uma versão memorizada da função que atualiza o estado
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permite que o valor seja uma função para ter a mesma API que useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Salva o estado
      setStoredValue(valueToStore);

      // Salva no localStorage se estiver no navegador
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  // Sincroniza o valor com outros tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, [key]);

  return [storedValue, setValue];
}
