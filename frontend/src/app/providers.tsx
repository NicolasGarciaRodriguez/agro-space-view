"use client";

import { useEffect } from "react";
import {
  setTokenGetter,
  setBaseUrl,
} from "@agrospace/shared/services/Http.service";
import { useAuthStore } from "@/stores/auth/Auth.store";
import config from "@/config/index.config";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    setTokenGetter(() => useAuthStore.getState().token);
    setBaseUrl(config.API_URL);
  }, []);

  return <>{children}</>;
};
