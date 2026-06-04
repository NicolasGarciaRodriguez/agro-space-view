import { DashboardLayout } from "./components/dashboardLayout/DashboardLayout.component";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
