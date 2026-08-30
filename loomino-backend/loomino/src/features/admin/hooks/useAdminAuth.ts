import { useSelector } from "react-redux";

import type { RootState } from "@/app/store/store";

/** Read-only access to the admin auth slice. */
export function useAdminAuth() {
  return useSelector(
    (state: RootState) => state.adminAuth,
  );
}
