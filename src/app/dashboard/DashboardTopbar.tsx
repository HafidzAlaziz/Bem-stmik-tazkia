"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FiX } from "react-icons/fi";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import MahasiswaCard from "@/components/mahasiswa/MahasiswaCard";
import { useRouter } from "next/navigation";

export default function DashboardTopbar({ user }: { user?: any }) {
  const supabase = createClient();
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const [hasCompletedProfile, setHasCompletedProfile] = useState<boolean | null>(null);
  const [hideProfileTooltip, setHideProfileTooltip] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkProfile = async () => {
      if (user) {
        const { data: mhsProfile } = await supabase
          .from('mahasiswa_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        setHasCompletedProfile(!!mhsProfile?.nim);
        if (mhsProfile) setProfileData(mhsProfile);
      }
    };
    checkProfile();
  }, [user, supabase]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCard(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fullName = user?.user_metadata?.full_name || user?.raw_user_meta_data?.full_name || "Mahasiswa";
  const avatarUrl = user?.user_metadata?.avatar_url || user?.raw_user_meta_data?.avatar_url || user?.user_metadata?.picture || user?.raw_user_meta_data?.picture;
  const initial = fullName.charAt(0).toUpperCase();

  const dummyProfile = {
    id: user?.id || '1',
    full_name: profileData?.full_name || fullName,
    nim: profileData?.nim || "Belum diisi",
    email: profileData?.email || user?.email || "",
    angkatan: profileData?.angkatan || new Date().getFullYear(),
    prodi: profileData?.prodi || "Belum diisi",
    avatar_url: profileData?.avatar_url || avatarUrl,
    bio: profileData?.bio || "Halo! Saya mahasiswa BEM STMIK Tazkia.",
    skills: profileData?.skills || [],
    status_badge: profileData?.status_badge || "🚀 Open for Collab",
    github_url: profileData?.github_url,
    linkedin_url: profileData?.linkedin_url,
    instagram_url: profileData?.instagram_url,
    website_url: profileData?.website_url,
  };

  return (
    <header className="w-full bg-surface border-b border-outline-variant/30 shadow-sm px-6 py-4 flex items-center justify-end gap-6 sticky top-0 z-10 transition-colors duration-300">
      
      {/* Profile Info */}
      <div className="flex items-center gap-3 relative" ref={dropdownRef}>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-on-surface leading-tight">{fullName}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mt-0.5">Mahasiswa</p>
        </div>
        
        <div onClick={() => setShowCard(!showCard)} className="block relative cursor-pointer select-none">
          {avatarUrl && !imgError ? (
            <img 
              src={avatarUrl} 
              alt="Avatar" 
              className={`w-10 h-10 rounded-full border-2 shrink-0 object-cover transition-colors ${showCard ? 'border-primary' : 'border-outline-variant/50 hover:border-primary'}`}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold border shrink-0 transition-colors ${showCard ? 'bg-primary/90 border-primary' : 'bg-primary border-primary/20 hover:bg-primary/90'}`}>
              {initial}
            </div>
          )}

          {/* Bubble Chat Tooltip */}
          <AnimatePresence>
            {!hideProfileTooltip && hasCompletedProfile === false && !showCard && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-full right-0 mt-4 z-50 animate-bounce cursor-pointer w-max"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setHideProfileTooltip(true); }}
              >
                <div className="bg-[var(--color-secondary)] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-secondary/30 relative flex items-center gap-2">
                  <span>✨ Ayo sesuaikan profilmu agar menarik!</span>
                  <button className="text-white/80 hover:text-white" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setHideProfileTooltip(true); }}>
                    <FiX size={14} />
                  </button>
                  {/* Triangle Pointer */}
                  <div className="absolute -top-1.5 right-3 w-3 h-3 bg-[var(--color-secondary)] rotate-45 rounded-sm"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card Dropdown */}
          <AnimatePresence>
            {showCard && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full right-0 mt-4 z-50 w-[340px]"
              >
                <div className="absolute -top-2 right-4 w-4 h-4 bg-surface border-t border-l border-outline-variant/30 rotate-45 z-0"></div>
                <div className="relative z-10 drop-shadow-2xl">
                  <MahasiswaCard 
                    mahasiswa={dummyProfile}
                    onSelect={() => {
                      setShowCard(false);
                      router.push("/mahasiswa");
                    }}
                  />
                  <div className="absolute top-4 right-4 z-20">
                    <button 
                      onClick={(e) => { e.stopPropagation(); router.push("/dashboard/profile"); setShowCard(false); }}
                      className="bg-white/20 hover:bg-white/40 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30 transition-all shadow-sm"
                    >
                      Edit Profil
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </header>
  );
}
