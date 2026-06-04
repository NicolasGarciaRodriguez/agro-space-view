"use client";

import { useEffect } from "react";
import { setTokenGetter } from "@agrospace/shared/services/Http.service";
import { useAuthStore } from "@/stores/auth/Auth.store";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    setTokenGetter(() => useAuthStore.getState().token);
  }, []);

  return <>{children}</>;
};
