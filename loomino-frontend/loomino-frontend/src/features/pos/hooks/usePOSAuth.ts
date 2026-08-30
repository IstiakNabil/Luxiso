import { useContext } from "react";

import { POSAuthContext } from "../context/posAuthContext";

/** Access role/permissions/locations anywhere under POSLayout. */
export function usePOSAuth() {
  const ctx = useContext(POSAuthContext);
  if (!ctx) {
    throw new Error("usePOSAuth must be used within POSAuthProvider");
  }
  return ctx;
}
