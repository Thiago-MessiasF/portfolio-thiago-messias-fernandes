import React, { createContext, useContext, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

interface ChurchTheme {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
}

interface ChurchContextType {
  church: ChurchTheme | null;
  isLoading: boolean;
  setChurchId: (id: number) => void;
  currentChurchId: number;
}

const DEFAULT_CHURCH_ID = 1;

const ChurchContext = createContext<ChurchContextType>({
  church: null,
  isLoading: true,
  setChurchId: () => {},
  currentChurchId: DEFAULT_CHURCH_ID,
});

export function ChurchProvider({ children }: { children: React.ReactNode }) {
  const [currentChurchId, setCurrentChurchId] = useState<number>(() => {
    const stored = localStorage.getItem("churchId");
    return stored ? parseInt(stored) : DEFAULT_CHURCH_ID;
  });

  const { data: church, isLoading } = trpc.churches.getById.useQuery(
    { id: currentChurchId },
    { retry: false }
  );

  useEffect(() => {
    if (church) {
      // Apply dynamic CSS variables for multi-tenant theming
      const root = document.documentElement;
      // Convert hex to oklch approximation via CSS custom properties
      root.style.setProperty("--church-primary", church.primaryColor);
      root.style.setProperty("--church-secondary", church.secondaryColor);
      root.style.setProperty("--church-accent", church.accentColor);

      // Update page title
      document.title = `${church.name} — ChurchStream`;

      // Update favicon if logo exists
      if (church.logoUrl) {
        const favicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
        if (favicon) favicon.href = church.logoUrl;
      }
    }
  }, [church]);

  const setChurchId = (id: number) => {
    localStorage.setItem("churchId", String(id));
    setCurrentChurchId(id);
  };

  return (
    <ChurchContext.Provider
      value={{
        church: church ?? null,
        isLoading,
        setChurchId,
        currentChurchId,
      }}
    >
      {children}
    </ChurchContext.Provider>
  );
}

export function useChurch() {
  return useContext(ChurchContext);
}
