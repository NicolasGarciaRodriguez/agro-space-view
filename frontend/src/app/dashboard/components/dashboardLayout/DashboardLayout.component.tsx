"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./components/sidebar/Sidebar.component";
import { TopBar } from "./components/topbar/Topbar.component";
import { Chatbot } from "@/components/chatbot/Chatbot.component";
import { EmailVerificationBanner } from "@/components/emailVerificationBanner/EmailVerificationBanner.component";
import { EmailBlockScreen } from "@/components/emailBlockScreen/EmailBlockScreen.component";
import { AuthRepository } from "@agrospace/shared/repositories/Auth.repository";
import { useAuthStore } from "@/stores/auth/Auth.store";
import { useEmailBlockStore } from "@/stores/emailBlock/EmailBlock.store";
import { EmailVerificationStatus } from "@agrospace/shared/enums/EmailVerificationStatus.enum";
import styles from "./DashboardLayout.module.scss";
import { DashboardLayoutProps } from "./DashboardLayout.interface";

const VERIFICATION_POLL_INTERVAL_MS = 30_000;

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const isBlocked = useEmailBlockStore((s) => s.isBlocked);

  useEffect(() => {
    if (!token) return;
    AuthRepository.getMe()
      .then((freshUser) => setAuth(token, freshUser))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (user?.emailVerificationStatus === EmailVerificationStatus.VERIFICADO) {
      return;
    }

    const interval = setInterval(() => {
      AuthRepository.getMe()
        .then((freshUser) => setAuth(token, freshUser))
        .catch(() => {});
    }, VERIFICATION_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [token, user?.emailVerificationStatus]);

  if (isBlocked) {
    return <EmailBlockScreen />;
  }

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={styles.layout__content}>
        <TopBar onMenuOpen={() => setSidebarOpen(true)} />
        <EmailVerificationBanner />
        <main className={styles.layout__main}>{children}</main>
      </div>
      <Chatbot />
    </div>
  );
};