"use client";

import { useEffect, useState } from "react";
import {
  setTokenGetter,
  setBaseUrl,
  setOnEmailVerificationRequired,
} from "@agrospace/shared/services/Http.service";
import { useAuthStore } from "@/stores/auth/Auth.store";
import { useEmailBlockStore } from "@/stores/emailBlock/EmailBlock.store";
import config from "@/config/index.config";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setTokenGetter(() => useAuthStore.getState().token);
    setBaseUrl(config.API_URL);
    setOnEmailVerificationRequired(() => {
      useEmailBlockStore.getState().setBlocked();
    });
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return <>{children}</>;
};