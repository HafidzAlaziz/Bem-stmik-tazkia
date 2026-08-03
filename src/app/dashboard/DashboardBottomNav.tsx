"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiAward, FiUser, FiHome, FiLogOut, FiEdit2, FiGithub, FiLinkedin, FiGlobe, FiFolder, FiShare2, FiSend, FiCopy, FiCheck, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import ProjectCard, { ProjectData } from "@/components/mahasiswa/ProjectCard";

export default function DashboardBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [showLogoutConfirm, setShowLogoutConfirm]   = useState(false);
  const [showProfileDrawer, setShowProfileDrawer]   = useState(false);
  const [profileData, setProfileData]               = useState<any>(null);
  const [profileProjects, setProfileProjects]       = useState<ProjectData[]>([]);
  const [projectFilter, setProjectFilter]           = useState<string>("Semua");
  const [profileLoading, setProfileLoading]         = useState(false);
  const [copiedLink, setCopiedLink]                 = useState(false);
  const [showShareModal, setShowShareModal]         = useState(false);

  // Scroll lock when modals are open
  useEffect(() => {
    if (showProfileDrawer || showLogoutConfirm || showShareModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showProfileDrawer, showLogoutConfirm, showShareModal]);

  const navLinks = [
    { name: "Karya",    href: "/dashboard", icon: <FiAward size={22} />,  exact: true },
    { name: "Beranda",  href: "/",          icon: <FiHome size={22} />,   exact: true },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleOpenProfile = async () => {
    setShowProfileDrawer(true);
    if (profileData) return; // sudah di-cache

    setProfileLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("mahasiswa_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setProfileData(profile);

        const { data: karya } = await supabase
          .from("karya")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "approved");

        if (karya) {
          setProfileProjects(karya.map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            tech_stack: p.tech_stack || [],
            demo_url: p.live_url,
            github_url: p.github_url,
            cover_image: p.image_url,
            likes_count: p.likes || 0,
            views_count: p.views || 0,
            category: p.category,
            created_at: p.created_at,
          })));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProfileLoading(false);
    }
  };

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/mahasiswa?id=${profileData?.id}`
    : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname?.startsWith(href);

  const isProfileActive = pathname?.startsWith("/dashboard/profile");

  return (
    <>
      {/* ── Bottom Nav ─────────────────────────────────────────── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <motion.nav
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="bg-white/80 dark:bg-surface/80 backdrop-blur-2xl border border-[var(--color-primary)]/30 shadow-[0_8px_30px_rgba(27,64,134,0.15)] px-3 py-2 rounded-full flex items-center gap-1 md:gap-2"
        >
          {/* Karya & Beranda */}
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="relative group px-4 py-2.5 md:px-6 md:py-3 outline-none">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`relative z-10 flex flex-row items-center justify-center gap-2 transition-colors duration-300 ${
                  isActive(link.href, link.exact) ? "text-white" : "text-on-surface-variant group-hover:text-primary"
                }`}
              >
                {link.icon}
                <span className="hidden md:inline text-sm font-bold">{link.name}</span>
              </motion.div>
              {isActive(link.href, link.exact) && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-secondary rounded-full -z-0 shadow-lg shadow-secondary/30"
                  initial={false}
                  transition={{ type: "spring", damping: 25, stiffness: 350 }}
                />
              )}
            </Link>
          ))}

          {/* Profil — buka drawer */}
          <button
            onClick={handleOpenProfile}
            className="relative group px-4 py-2.5 md:px-6 md:py-3 outline-none"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`relative z-10 flex flex-row items-center justify-center gap-2 transition-colors duration-300 ${
                isProfileActive || showProfileDrawer ? "text-white" : "text-on-surface-variant group-hover:text-primary"
              }`}
            >
              <FiUser size={22} />
              <span className="hidden md:inline text-sm font-bold">Profil</span>
            </motion.div>
            {(isProfileActive || showProfileDrawer) && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-secondary rounded-full -z-0 shadow-lg shadow-secondary/30"
                initial={false}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
              />
            )}
          </button>

          <div className="w-px h-8 bg-outline-variant/30 mx-1 md:mx-2" />

          {/* Keluar */}
          <button onClick={() => setShowLogoutConfirm(true)} className="relative group px-4 py-2.5 md:px-6 md:py-3 outline-none">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10 flex flex-row items-center justify-center gap-2 text-red-400 group-hover:text-red-500 transition-colors duration-300"
            >
              <FiLogOut size={22} />
              <span className="hidden md:inline text-sm font-bold">Keluar</span>
            </motion.div>
          </button>
        </motion.nav>
      </div>

      {/* ── Profile Full-Screen Overlay ─────────────────────────────────────── */}
      <AnimatePresence>
        {showProfileDrawer && (
          <div className="fixed inset-0 z-[100] flex justify-center bg-surface">
            {/* Full Screen Panel */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full h-full overflow-y-auto z-10 flex flex-col"
            >
              {/* Top Banner (Full Width) */}
              <div className="relative h-48 sm:h-64 w-full bg-primary overflow-hidden flex-shrink-0">
                <motion.div
                  animate={{ x: [0, -20], y: [0, -20] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 w-[150%] h-[150%] opacity-20 pointer-events-none"
                  style={{ backgroundImage: "radial-gradient(circle at center, #ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }}
                />
                <motion.div
                  animate={{ x: ["-100%", "300%"] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
                  className="absolute top-0 bottom-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

                {/* Angkatan badge */}
                {profileData?.angkatan && (
                  <div className="absolute top-6 left-6 md:left-12 z-10">
                    <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider border border-white/20 shadow-sm">
                      Angkatan {profileData.angkatan}
                    </span>
                  </div>
                )}

                {/* Close button */}
                <button
                  onClick={() => setShowProfileDrawer(false)}
                  className="absolute top-6 right-6 md:right-12 z-20 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 hover:scale-105 transition-all backdrop-blur-md border border-white/20 shadow-lg"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Profile Body (Centered Content) */}
              <div className="w-full max-w-5xl mx-auto px-6 md:px-12 pb-28 flex-1 flex flex-col">
                {profileLoading ? (
                  <div className="flex items-center justify-center py-32">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : !profileData ? (
                  <div className="text-center py-24 px-4 bg-surface-variant/20 rounded-3xl mt-12">
                    <p className="text-on-surface-variant mb-6 text-base font-medium">Profil kamu belum dilengkapi.</p>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setShowProfileDrawer(false)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-lg"
                    >
                      <FiEdit2 size={16} /> Lengkapi Profil Sekarang
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Header Layout (Avatar + Actions) */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-8 relative z-10">
                      
                      {/* Avatar and Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
                        <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-surface shadow-xl overflow-hidden border-4 border-surface shrink-0">
                          {profileData?.avatar_url ? (
                            <Image src={profileData.avatar_url} alt={profileData.full_name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-secondary text-white flex items-center justify-center text-4xl font-bold">
                              {profileData?.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 pb-2">
                          {(profileData?.status_badge || profileData?.skills?.[0]) && (
                            <div className="flex items-center gap-1.5 bg-secondary backdrop-blur-sm rounded-full px-4 py-1.5 shadow-md">
                              <span className="text-white text-xs font-bold tracking-wide">{profileData.status_badge || profileData.skills?.[0]}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pb-2">
                        <Link
                          href="/dashboard/profile"
                          onClick={() => setShowProfileDrawer(false)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-primary text-primary bg-surface font-bold text-sm hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                          <FiEdit2 size={16} /> <span className="hidden sm:inline">Edit Profil</span>
                        </Link>
                        <button
                          onClick={() => setShowShareModal(true)}
                          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary/90 transition-all shadow-sm"
                        >
                          <FiShare2 size={16} />
                          <span className="hidden sm:inline">Bagikan</span>
                        </button>
                        {profileData.github_url && (
                          <a href={profileData.github_url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-surface-variant hover:bg-outline-variant text-on-surface transition-all border border-outline-variant/30 shadow-sm hover:-translate-y-0.5">
                            <FiGithub size={18} />
                          </a>
                        )}
                        {profileData.linkedin_url && (
                          <a href={profileData.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-surface-variant hover:bg-outline-variant text-on-surface transition-all border border-outline-variant/30 shadow-sm hover:-translate-y-0.5">
                            <FiLinkedin size={18} />
                          </a>
                        )}
                        {profileData.website_url && (
                          <a href={profileData.website_url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-surface-variant hover:bg-outline-variant text-on-surface transition-all border border-outline-variant/30 shadow-sm hover:-translate-y-0.5">
                            <FiGlobe size={18} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Name & Info */}
                    <div className="mb-8">
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-primary leading-tight mb-2">{profileData.full_name}</h2>
                      <p className="text-base font-bold text-secondary mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
                        {profileData.prodi}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profileData?.skills?.map((skill: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 rounded-full bg-surface-variant text-on-surface text-xs font-bold shadow-sm">{skill}</span>
                        ))}
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-on-surface-variant text-[15px] leading-relaxed mb-8 bg-surface-variant/30 p-5 md:p-6 rounded-2xl border border-outline-variant/20 shadow-sm">
                      {profileData.bio || "Halo! Saya mahasiswa BEM STMIK Tazkia. Saya siap untuk berkolaborasi dan menciptakan karya-karya inovatif."}
                    </p>

                    {/* Projects Header & Filter */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b-2 border-outline-variant/30">
                      <div className="flex items-center gap-3 font-bold text-base text-primary">
                        <FiFolder size={20} />
                        <span>Proyek & Repository Publik ({profileProjects.length})</span>
                      </div>
                      {/* Filter Chips */}
                      {profileProjects.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {["Semua", ...Array.from(new Set(profileProjects.map(p => p.category).filter(Boolean)))].map((cat: any) => (
                            <button
                              key={cat}
                              onClick={() => setProjectFilter(cat)}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                                projectFilter === cat
                                  ? "bg-secondary text-white"
                                  : "bg-surface-variant text-on-surface-variant hover:text-primary hover:bg-outline-variant/30"
                              }`}
                            >
                              {cat === "Technology" ? "Web & Sistem" : cat === "Programming" ? "Mobile" : cat === "Research" ? "KTI & Jurnal" : cat}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Project Grid */}
                    {profileProjects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnimatePresence mode="popLayout">
                          {profileProjects
                            .filter((project) => projectFilter === "Semua" || project.category === projectFilter)
                            .map((project) => (
                              <motion.div
                                key={project.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ProjectCard project={project} />
                              </motion.div>
                            ))}
                        </AnimatePresence>
                        {profileProjects.filter((project) => projectFilter === "Semua" || project.category === projectFilter).length === 0 && (
                          <div className="col-span-1 md:col-span-2 text-center py-10 bg-surface-variant/20 rounded-2xl border border-dashed border-outline-variant">
                            <p className="text-on-surface-variant text-sm">Tidak ada proyek dalam kategori {projectFilter}.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-16 px-4 rounded-3xl bg-surface-variant/20 border-2 border-dashed border-outline-variant">
                        <FiFolder size={48} className="mx-auto text-on-surface-variant/30 mb-4" />
                        <p className="font-bold text-lg text-on-surface mb-2">Belum ada karya publik</p>
                        <p className="text-sm text-on-surface-variant max-w-md mx-auto">
                          Karya yang telah di-upload dan disetujui (status publik) akan tampil di sini. Mulai unggah karyamu sekarang!
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Share Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showShareModal && profileData && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowShareModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-surface p-6 rounded-3xl w-full max-w-sm shadow-2xl border border-outline-variant/30 flex flex-col items-center"
            >
              <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 p-2 bg-surface-variant text-on-surface-variant hover:text-primary rounded-full transition-colors">
                <FiX size={20} />
              </button>
              <h3 className="text-xl font-extrabold text-primary mb-2 mt-2 text-center">Bagikan Profil</h3>
              <p className="text-sm text-on-surface-variant text-center mb-6">Scan QR code atau salin tautan untuk membagikan portofoliomu.</p>
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-outline-variant/20 mb-6">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}&margin=0`} alt="QR Code" className="w-40 h-40" />
              </div>
              <div className="w-full flex items-center bg-surface-variant/30 border border-outline-variant/50 rounded-xl overflow-hidden p-1.5 gap-2">
                <input type="text" readOnly value={shareUrl} className="flex-1 bg-transparent px-3 py-2 text-xs text-on-surface-variant outline-none" />
                <button
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${copiedLink ? "bg-secondary text-white" : "bg-primary text-white hover:bg-primary/90"}`}
                >
                  {copiedLink ? <FiCheck size={14} /> : <FiCopy size={14} />}
                  {copiedLink ? "Tersalin" : "Salin"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Logout Confirm Modal ────────────────────────────────── */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative bg-surface rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center border border-outline-variant/20 z-10"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
                <FiLogOut size={28} />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">Konfirmasi Keluar</h3>
              <p className="text-on-surface-variant text-sm mb-8">Apakah kamu yakin ingin keluar dari akun ini?</p>
              <div className="flex w-full gap-3">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 px-4 rounded-xl font-bold text-on-surface bg-surface-variant hover:bg-outline-variant transition-colors">
                  Batal
                </button>
                <button onClick={handleLogout} className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30">
                  Ya, Keluar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
