"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiCheck, FiFolder, FiChevronRight } from "react-icons/fi";
import Image from "next/image";
import { useToast } from "@/components/ui/Toast";

export interface MahasiswaProfile {
  id: string;
  user_id?: string;
  full_name: string;
  email: string;
  contact_email?: string;
  angkatan: number;
  prodi: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  status_badge?: string;
  github_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  website_url?: string;
  skills: string[];
  is_featured?: boolean;
  projects_count?: number;
}

interface MahasiswaCardProps {
  mahasiswa: MahasiswaProfile;
  onSelect: (mahasiswa: MahasiswaProfile) => void;
}

export default function MahasiswaCard({ mahasiswa, onSelect }: MahasiswaCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(mahasiswa)}
      className="group cursor-pointer relative bg-surface rounded-3xl border border-outline-variant/30 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
    >
      {/* Animated Card Header Banner */}
      <div className="relative h-32 w-full bg-primary overflow-hidden p-4">
        {/* Subtle drifting grid background for texture */}
        <motion.div
          animate={{ x: [0, -20], y: [0, -20] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-[150%] h-[150%] opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at center, #ffffff 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }}
        />

        {/* Premium Shimmer Sweep Effect using safe standard Tailwind classes */}
        <motion.div
          animate={{ x: ["-100%", "300%"] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 1.5,
            ease: "easeInOut"
          }}
          className="absolute top-0 bottom-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 pointer-events-none"
        />

        {/* Clean overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

        {/* Header Badges */}
        <div className="relative z-10 flex items-center justify-start">
          {/* Angkatan Pill */}
          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider border border-white/20 shadow-sm whitespace-nowrap shrink-0">
            Angkatan {mahasiswa.angkatan}
          </span>
        </div>

        {/* Badges in Banner Bottom Right */}
        <div className="absolute bottom-3 right-3 z-10 flex flex-col items-end gap-1.5">
          {mahasiswa.status_badge && (
            <div className="flex items-center gap-1.5 bg-secondary rounded-full px-2.5 py-1 shadow-sm shrink-0">
              <span className="text-white text-[10px] font-bold whitespace-nowrap">
                {mahasiswa.status_badge}
              </span>
            </div>
          )}
          {mahasiswa.skills && mahasiswa.skills.length > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <div className="flex items-center gap-1.5 bg-white text-secondary rounded-full px-2.5 py-1 shadow-sm border border-secondary/20 shrink-0">
                <span className="text-[10px] font-bold whitespace-nowrap">
                  {mahasiswa.skills[0]}
                </span>
              </div>
              {mahasiswa.skills.length > 1 && (
                <div className="flex items-center justify-center bg-white/90 backdrop-blur-sm text-secondary rounded-full px-1.5 py-1 shadow-sm border border-secondary/20 text-[10px] font-bold shrink-0">
                  +{mahasiswa.skills.length - 1}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Avatar & Card Body */}
      <div className="px-6 pb-6 pt-0 relative flex-1 flex flex-col justify-between">
        {/* Avatar & Quick Gmail Row */}
        <div className="relative -mt-10 mb-3 flex items-end justify-between">
          <div className="flex items-end gap-3">
            {/* Avatar Box with Fallback Error Protection */}
            <div className="relative w-20 h-20 rounded-2xl p-1 bg-surface shadow-lg overflow-hidden border-2 border-white group-hover:border-secondary group-hover:scale-105 transition-all duration-300 shrink-0">
              {mahasiswa.avatar_url && !imgError ? (
                <Image
                  src={mahasiswa.avatar_url}
                  alt={mahasiswa.full_name}
                  fill
                  onError={() => setImgError(true)}
                  className="object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-secondary text-white flex items-center justify-center text-2xl font-black shadow-inner">
                  {mahasiswa.full_name ? mahasiswa.full_name.charAt(0).toUpperCase() : "M"}
                </div>
              )}
            </div>
          </div>

          {/* Quick Gmail Action Button */}
          <a
            href={`mailto:${mahasiswa.contact_email || mahasiswa.email}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm bg-surface-variant hover:bg-primary/10 text-on-surface hover:text-primary border border-outline-variant/30"
            title="Kirim Email"
          >
            <FiMail size={14} className="text-secondary" />
            <span>Gmail</span>
          </a>
        </div>



        {/* Name & Prodi */}
        <div className="mb-2">
          <h3 className="text-lg font-extrabold text-primary group-hover:text-secondary transition-colors line-clamp-1">
            {mahasiswa.full_name}
          </h3>
          <p className="text-xs font-bold text-on-surface-variant">
            {mahasiswa.prodi}
          </p>
        </div>

        {/* Bio */}
        <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-4 min-h-[2rem]">
          {mahasiswa.bio || "Halo! Saya mahasiswa BEM STMIK Tazkia."}
        </p>



        {/* Bottom Footer Action */}
        <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between mt-auto">
          {/* Project Count Indicator */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant">
            <FiFolder size={14} className="text-secondary" />
            <span>{mahasiswa.projects_count ?? 0} Proyek</span>
          </div>

          <span className="flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
            Lihat Portfolio
            <FiChevronRight size={16} />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
