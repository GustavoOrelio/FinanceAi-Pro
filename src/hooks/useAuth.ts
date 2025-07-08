import { useApp } from "@/contexts/AppContext";

export function useAuth() {
  const { user, isLoading: loading } = useApp();
  return { user, loading };
}
