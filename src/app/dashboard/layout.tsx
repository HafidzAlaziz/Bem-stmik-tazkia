import React from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardTopbar from "./DashboardTopbar";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Dashboard Mahasiswa - BEM STMIK Tazkia",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-surface-variant/20 flex flex-col md:flex-row">
      <DashboardSidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
        <DashboardTopbar user={user} />
        <div className="p-4 md:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
