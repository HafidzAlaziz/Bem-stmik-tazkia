"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiGrid, FiUser, FiLogOut, FiMenu, FiX, FiHome } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false); // For mobile

  const links = [
    { name: "Dashboard Karya", href: "/dashboard", icon: <FiGrid size={20} />, exact: true },
    { name: "Sesuaikan Profilmu", href: "/dashboard/profile", icon: <FiUser size={20} /> },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Portal Inovasi</h2>
          <p className="text-xs font-bold text-white/70 uppercase tracking-wider mt-1">Mahasiswa Dashboard</p>
        </div>
        <button className="md:hidden text-white/80 hover:text-white" onClick={() => setIsOpen(false)}>
          <FiX size={24} />
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const isActive = link.exact ? pathname === link.href : pathname?.startsWith(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm ${
                isActive
                  ? "bg-[var(--color-secondary)] text-white shadow-lg shadow-secondary/20"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 pt-6 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm text-white/70 hover:bg-white/10 hover:text-white"
        >
          <FiHome size={20} />
          Kembali ke Website
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm text-red-400 hover:bg-red-500/20"
        >
          <FiLogOut size={20} />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header (Hamburger) */}
      <div className="md:hidden sticky top-0 z-40 bg-[var(--color-primary)] border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="font-bold text-white">Portal Inovasi</div>
        <button onClick={() => setIsOpen(true)} className="p-2 bg-white/10 rounded-lg text-white">
          <FiMenu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-[var(--color-primary)] border-r border-white/10 shadow-xl md:shadow-none md:static transition-transform duration-300 ease-in-out flex-shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
