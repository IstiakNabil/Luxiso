import { useSelector } from "react-redux";

import type { RootState } from "@/app/store/store";

/** Read-only access to the auth slice. */
export function useAuth() {
  return useSelector((state: RootState) => state.auth);
}
