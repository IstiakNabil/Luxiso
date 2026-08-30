import { useEffect } from "react";
import { useDispatch } from "react-redux";

import type { AppDispatch } from "@/app/store/store";
import { restoreSession } from "../store/authSlice";

interface AuthInitializerProps {
  children: React.ReactNode;
}

function AuthInitializer({
  children,
}: AuthInitializerProps) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const accessToken =
      localStorage.getItem("accessToken");

    const refreshToken =
      localStorage.getItem("refreshToken");

    const user =
      localStorage.getItem("user");

    if (
      accessToken &&
      refreshToken &&
      user
    ) {
      dispatch(
        restoreSession({
          user: JSON.parse(user),
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),
      );
    }
  }, [dispatch]);

  return <>{children}</>;
}

export default AuthInitializer;