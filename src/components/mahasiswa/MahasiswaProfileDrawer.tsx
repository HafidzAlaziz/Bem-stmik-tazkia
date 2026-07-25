"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiGithub, FiLinkedin, FiInstagram, FiGlobe, FiBriefcase, FiMail, FiCheck, FiFolder, FiStar, FiExternalLink, FiSend } from "react-icons/fi";
import Image from "next/image";
import ProjectCard, { ProjectData } from "./ProjectCard";
import { MahasiswaProfile } from "./MahasiswaCard";

interface MahasiswaProfileDrawerProps {
  mahasiswa: MahasiswaProfile | null;
  projects: ProjectData[];
  onClose: () => void;
}

export default function MahasiswaProfileDrawer({
  mahasiswa,
  projects,
  onClose,
}: MahasiswaProfileDrawerProps) {
  const [activeTab, setActiveTab] = useState<"projects" | "skills">("projects");

  useEffect(() => {
    if (mahasiswa) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, [mahasiswa]);

  if (!mahasiswa) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />



        {/* Slide-over Drawer Panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="relative w-full max-w-2xl bg-surface h-full shadow-2xl overflow-y-auto z-10 flex flex-col border-l border-outline-variant/30"
        >
          {/* Top Banner */}
          <div className="relative h-40 sm:h-48 w-full bg-primary overflow-hidden flex-shrink-0">
            {/* Animated grid background */}
            <motion.div
              animate={{ x: [0, -20], y: [0, -20] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 w-[150%] h-[150%] opacity-20 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle at center, #ffffff 1px, transparent 1px)",
                backgroundSize: "20px 20px"
              }}
            />
            {/* Shimmer sweep */}
            <motion.div
              animate={{ x: ["-100%", "300%"] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
              className="absolute top-0 bottom-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 pointer-events-none"
            />
            {/* Depth overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

            {/* Angkatan badge - top left */}
            <div className="absolute top-4 left-5 z-10">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider border border-white/20">
                Angkatan {mahasiswa.angkatan}
              </span>
            </div>

            {/* Close button - top right */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-all"
            >
              <FiX size={18} />
            </button>

            {/* Bottom section: Avatar (left) + Stats (right) */}
            <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between px-5 pb-4">
              {/* Avatar - Circular */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-surface shadow-xl overflow-hidden border-4 border-white/50 flex-shrink-0">
                {mahasiswa.avatar_url ? (
                  <Image
                    src={mahasiswa.avatar_url}
                    alt={mahasiswa.full_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary text-white flex items-center justify-center text-3xl font-bold shadow-inner">
                    {mahasiswa.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Right side info: role badge + top skills */}
              <div className="flex flex-col items-end gap-2">
                {/* Role Badge - from status_badge or fallback */}
                {(mahasiswa.status_badge || mahasiswa.skills?.[0]) && (
                  <div className="flex items-center gap-1.5 bg-secondary backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
                    <span className="text-white text-xs font-bold">
                      {mahasiswa.status_badge || mahasiswa.skills?.[0]}
                    </span>
                  </div>
                )}
                {/* Top skills - orange accent */}
                <div className="flex flex-wrap justify-end gap-1.5">
                  {mahasiswa.skills?.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-full bg-white/90 text-primary text-[10px] font-extrabold shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Body - scrollable */}
          <div className="px-5 pt-4 pb-6 flex-1 flex flex-col">
            {/* Name row + Social buttons */}
            <div className="flex items-start justify-between gap-3 mb-3">
              {/* Name & Info */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-primary leading-tight">
                    {mahasiswa.full_name}
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
                  <FiBriefcase size={14} />
                  <span className="truncate">{mahasiswa.prodi}</span>
                </div>
              </div>

              {/* Social & Contact Buttons - top right */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`mailto:${mahasiswa.contact_email || mahasiswa.email}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all shadow-sm bg-primary text-white hover:bg-primary/90"
                  title="Kirim Email"
                >
                  <FiMail size={14} />
                  <span className="hidden sm:inline">Gmail</span>
                </a>

                {mahasiswa.github_url && (
                  <a
                    href={mahasiswa.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-surface-variant hover:bg-outline-variant text-on-surface transition-all border border-outline-variant/30"
                    title="GitHub"
                  >
                    <FiGithub size={16} />
                  </a>
                )}

                {mahasiswa.linkedin_url && (
                  <a
                    href={mahasiswa.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-surface-variant hover:bg-outline-variant text-on-surface transition-all border border-outline-variant/30"
                    title="LinkedIn"
                  >
                    <FiLinkedin size={16} />
                  </a>
                )}

                {mahasiswa.website_url && (
                  <a
                    href={mahasiswa.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-surface-variant hover:bg-outline-variant text-on-surface transition-all border border-outline-variant/30"
                    title="Website"
                  >
                    <FiGlobe size={16} />
                  </a>
                )}
              </div>
            </div>

            {/* Bio */}
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6 bg-surface-variant/40 p-4 rounded-2xl border border-outline-variant/20">
              {mahasiswa.bio || "Halo! Saya mahasiswa BEM STMIK Tazkia."}
            </p>

            {/* Email Direct Action Card */}
            <div className="bg-surface-variant/30 p-5 rounded-2xl border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div>
                <h4 className="text-sm font-bold text-primary">Ingin Mengajak Kolaborasi?</h4>
                <p className="text-xs text-on-surface-variant">
                  Hubungi via email untuk mendiskusikan peluang kolaborasi.
                </p>
              </div>
              <a
                href={`mailto:${mahasiswa.contact_email || mahasiswa.email}`}
                className="px-4 py-2.5 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-secondary/90 transition-all flex items-center gap-2 shadow-sm shrink-0"
              >
                <FiSend size={14} />
                Kirim Email Direct
              </a>
            </div>

            {/* Section Navigation */}
            <div className="flex border-b border-outline-variant/30 mb-6">
              <div className="flex items-center gap-2 pb-3 px-4 font-bold text-sm border-b-2 border-primary text-primary">
                <FiFolder size={16} />
                <span>Proyek & Repository ({projects.length})</span>
              </div>
            </div>

            {/* Content: Projects */}
            <div className="space-y-4">
                {projects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {projects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4 rounded-2xl bg-surface-variant/30 border border-dashed border-outline-variant">
                    <FiFolder size={40} className="mx-auto text-on-surface-variant/40 mb-3" />
                    <p className="font-bold text-on-surface mb-1">Belum ada proyek yang diunggah</p>
                    <p className="text-xs text-on-surface-variant">
                      Mahasiswa ini belum mengunggah repositori proyek ke portal.
                    </p>
                  </div>
                )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
