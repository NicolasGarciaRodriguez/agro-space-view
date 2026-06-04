"use client";

import { useState } from "react";
import { Sidebar } from "./components/sidebar/Sidebar.component";
import { TopBar } from "./components/topbar/Topbar.component";
import styles from "./DashboardLayout.module.scss";
import { DashboardLayoutProps } from "./DashboardLayout.interface";

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={styles.layout__content}>
        <TopBar onMenuOpen={() => setSidebarOpen(true)} />
        <main className={styles.layout__main}>{children}</main>
      </div>
    </div>
  );
};
