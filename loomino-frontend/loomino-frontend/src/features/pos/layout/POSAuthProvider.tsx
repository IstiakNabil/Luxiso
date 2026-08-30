import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { getPOSMe } from "../services/pos.service";
import { POSAuthContext } from "../context/posAuthContext";

export function POSAuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ["pos", "me"],
    queryFn: getPOSMe,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <POSAuthContext.Provider value={{ me: data, isLoading }}>
      {children}
    </POSAuthContext.Provider>
  );
}
