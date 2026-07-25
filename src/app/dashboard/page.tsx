import React from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { FiPlus, FiFileText } from "react-icons/fi";
import { redirect } from "next/navigation";
import DashboardKaryaList from "./DashboardKaryaList";

export const revalidate = 0;

export default async function UserDashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get user's karya
  const { data: karyaList } = await supabase
    .from("karya")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="w-full">
      <div className="w-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--color-primary)] mb-2">
              Dashboard Karya
            </h1>
            <p className="text-on-surface-variant">
              Halo, <span className="font-semibold text-on-surface">{profile?.full_name || 'User'}</span>. Kelola dan pantau status karya inovasimu di sini.
            </p>
          </div>
          <Link 
            href="/dashboard/upload" 
            className="flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl font-bold hover:bg-[var(--color-primary)]/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <FiPlus size={20} /> Upload Karya Baru
          </Link>
        </div>

        <div className="bg-surface rounded-3xl shadow-sm border border-outline-variant/30 p-6 md:p-8">
          <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
            <FiFileText className="text-[var(--color-secondary)]" /> Karya Saya
          </h2>

          <DashboardKaryaList initialKaryaList={karyaList || []} />
        </div>
      </div>
    </div>
  );
}
