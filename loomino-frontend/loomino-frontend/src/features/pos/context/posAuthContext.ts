import { createContext } from "react";

import type { POSMeResponse } from "../types/pos";

export interface POSAuthContextValue {
  isLoading: boolean;
  me: POSMeResponse | undefined;
}

export const POSAuthContext = createContext<POSAuthContextValue | null>(null);
