"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FiArrowLeft, FiHeart, FiEye, FiGithub, FiExternalLink,
  FiCalendar, FiTag, FiShare2
} from "react-icons/fi";
import { motion } from "framer-motion";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { getDeviceId } from "@/utils/identity";

const categoryColors: Record<string, string> = {
  TECHNOLOGY: "bg-blue-100 text-blue-700",
  "UI/UX": "bg-purple-100 text-purple-700",
  RESEARCH: "bg-green-100 text-green-700",
  PROGRAMMING: "bg-orange-100 text-orange-700",
  "COMMUNITY SERVICE": "bg-pink-100 text-pink-700",
  MULTIMEDIA: "bg-yellow-100 text-yellow-700",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchProjectAndTrackView = async () => {
      try {
        const { data, error } = await supabase
          .from('karya')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error || !data) {
          setLoading(false);
          return;
        }

        setProject(data);
        setViewCount(data.views || 0);
        setLikeCount(data.likes || 0);
        setLoading(false);

        // Check authenticated user
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || null;

        // Anti-Spam View & Likes Tracking (Universal Identity)
        const deviceId = getDeviceId();

        // Check if already liked via RPC (Bypass RLS on logs)
        const { data: isLiked } = await supabase.rpc('check_karya_liked', {
          p_karya_id: id,
          p_device_id: deviceId,
          p_user_id: userId
        });
          
        if (isLiked) {
          setLiked(true);
        }

        // Increment view via RPC (Cooldown 24 Jam)
        const { error: rpcError } = await supabase.rpc('increment_karya_view', { 
          p_karya_id: id, 
          p_device_id: deviceId,
          p_user_id: userId
        });
        
        // Catatan: Jika RPC berhasil, artinya view bertambah di DB (atau di-ignore jika masih cooldown).
        // Untuk optimisasi UX, kita bisa fetch ulang jumlah view terbaru, atau biarkan saja.
        
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectAndTrackView();
    }
  }, [id, supabase]);

  const handleToggleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    
    // Optimistic UI Update
    setLiked(!liked);
    setLikeCount(prev => liked ? Math.max(0, prev - 1) : prev + 1);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;
      const deviceId = getDeviceId();

      const { data: isNowLiked, error } = await supabase.rpc('toggle_karya_like', {
        p_karya_id: id,
        p_device_id: deviceId || 'unknown',
        p_user_id: userId
      });

      if (error) throw error;
      
      // Sync with actual DB result just in case
      setLiked(isNowLiked);
    } catch (err) {
      console.error(err);
      // Revert optimistic update on error
      setLiked(liked);
      setLikeCount(prev => liked ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    if (!project) return;
    const shareData = {
      title: project.title,
      text: `Lihat karya inovatif "${project.title}" di Portal Inovasi BEM STMIK Tazkia!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast("Tautan disalin ke clipboard!", "success");
      } catch (err) {
        toast("Gagal menyalin tautan", "error");
      }
    }
  };

  // Setup slider images (safe to run before early returns, project might be null initially)
  const sliderImages = project 
    ? [
        project.image_url,
        ...(Array.isArray(project.gallery) ? project.gallery.map((g: any) => typeof g === 'string' ? g : g.url) : [])
      ].filter(Boolean)
    : [];

  useEffect(() => {
    if (sliderImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [sliderImages.length]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--color-background)] pt-28 pb-32">
        <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-4">404</h1>
          <p className="text-on-surface-variant mb-6">Proyek tidak ditemukan.</p>
          <Link href="/karya" className="text-[var(--color-primary)] font-semibold flex items-center gap-2 justify-center hover:gap-3 transition-all">
            <FiArrowLeft /> Kembali ke Karya
          </Link>
        </div>
      </main>
    );
  }

  // Handle Team (fallback to creator if empty)
  const team = Array.isArray(project.team) && project.team.length > 0 
    ? project.team 
    : [{ name: "Kreator", role: "Project Lead" }];

  // Parse team members – format bisa "Name (Role)" string atau object {name, role, avatar}
  const parsedTeam = team.map((member: any) => {
    if (typeof member === 'string') {
      const match = member.match(/^(.+?)\s*\((.+)\)$/);
      return match ? { name: match[1].trim(), role: match[2].trim(), avatar: '', user_id: '' } : { name: member, role: 'Anggota Tim', avatar: '', user_id: '' };
    }
    return { name: member.name || 'Anggota', role: member.role || 'Tim', avatar: member.avatar || '', user_id: member.user_id || '' };
  });

  // Handle Features
  const features = Array.isArray(project.features) && project.features.length > 0
    ? project.features
    : [{ title: "Fitur Utama", desc: "Tidak ada detail fitur spesifik yang disediakan." }];

  return (
    <main className="min-h-screen bg-[#f8f9fc] pt-28 pb-32 md:pb-20">
      {/* ── HERO BANNER ─────────────────────────────────────────── */}
      <div className="relative h-[420px] md:h-[520px] w-full overflow-hidden mb-0 bg-black">
        {sliderImages.length > 0 ? (
          sliderImages.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`${project.title} - Slide ${idx + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-80' : 'opacity-0'}`}
            />
          ))
        ) : (
          <img
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200"
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10" />

        <Link
          href="/karya"
          className="absolute top-6 left-6 md:left-10 z-20 flex items-center gap-2 text-white/90 hover:text-white bg-black/30 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:-translate-x-1"
        >
          <FiArrowLeft size={15} /> Semua Karya
        </Link>

        <div className="absolute top-6 right-6 md:right-10 z-20">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${categoryColors[project.category] ?? "bg-surface/20 text-white"} backdrop-blur-sm`}>
            {project.category}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-14 md:px-10 pb-14 md:pb-10 max-w-7xl mx-auto z-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight max-w-3xl">
              {project.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/80 text-[11px] md:text-sm mt-4">
              <span className="flex items-center gap-1.5"><FiCalendar size={13} /> {new Date(project.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className="flex items-center gap-1.5"><FiEye size={13} /> {viewCount.toLocaleString()} Kali Dilihat</span>
              <span className="flex items-center gap-1.5"><FiHeart size={13} /> {likeCount.toLocaleString()} Disukai</span>
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${project.status === "approved" ? "bg-green-400" : "bg-yellow-400"} animate-pulse`} />
                {project.status === 'approved' ? 'Publik' : 'Menunggu Review'}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── LEFT SIDEBAR ─────────────────────────────── */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-surface rounded-2xl p-5 border border-outline-variant/20 shadow-sm flex gap-3">
              <button
                onClick={handleToggleLike}
                disabled={isLiking}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-300 border ${liked ? "bg-red-50 border-red-200 text-red-500" : "border-outline-variant/30 text-on-surface-variant hover:border-red-200 hover:text-red-500"} ${isLiking ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                <div className="w-6 h-6 flex items-center justify-center -ml-1 shrink-0">
                  {liked ? (
                    <DotLottieReact src="/animations/Heart Animated.lottie" autoplay loop={false} />
                  ) : (
                    <FiHeart size={16} />
                  )}
                </div>
                {likeCount.toLocaleString()}
              </button>
              <button 
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-300 border border-outline-variant/30 text-on-surface-variant hover:border-gray-400"
              >
                <FiShare2 size={16} /> Bagikan
              </button>
            </div>

            {(project.github_url || project.live_url) && (
              <div className="bg-surface rounded-2xl p-5 border border-outline-variant/20 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-on-surface-variant/70 uppercase tracking-wider">Tautan</h3>
                {project.github_url && (
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all">
                    <FiGithub size={16} /> Repositori GitHub
                  </a>
                )}
                {project.live_url && (
                  <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all">
                    <FiExternalLink size={16} /> Live Demo
                  </a>
                )}
              </div>
            )}

            <div className="bg-surface rounded-2xl p-5 border border-outline-variant/20 shadow-sm">
              <h3 className="text-sm font-bold text-on-surface-variant/70 uppercase tracking-wider mb-4">Tim Pembuat</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {parsedTeam.map((member: any, i: number) => {
                  const initials = (member.name || 'U').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                  
                  const content = (
                    <div className={`bg-surface-variant/10 p-3 rounded-xl border flex items-center gap-3 transition-colors ${member.user_id ? 'border-primary/30 hover:border-primary/60 hover:bg-primary/5 cursor-pointer' : 'border-outline-variant/20'}`}>
                      <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 text-white flex items-center justify-center font-bold text-sm border border-outline-variant/20 overflow-hidden shadow-sm">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm truncate ${member.user_id ? 'text-primary group-hover:text-primary-dark transition-colors' : 'text-on-surface'}`}>{member.name}</p>
                        <p className="text-[10px] text-[var(--color-secondary)] font-bold uppercase tracking-wider mt-0.5 truncate">{member.role}</p>
                      </div>
                    </div>
                  );

                  return (
                    <React.Fragment key={i}>
                      {member.user_id ? (
                        <Link href={`/mahasiswa?id=${member.user_id}`} className="block group">
                          {content}
                        </Link>
                      ) : (
                        content
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {project.tech_stack && project.tech_stack.length > 0 && (
              <div className="bg-surface rounded-2xl p-5 border border-outline-variant/20 shadow-sm">
                <h3 className="text-sm font-bold text-on-surface-variant/70 uppercase tracking-wider mb-4">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack.map((t: string) => (
                    <span key={t} className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold rounded-full">
                      <FiTag size={10} /> {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* ── MAIN ARTICLE ─────────────────────────────── */}
          <article className="lg:col-span-2 space-y-10">
            <motion.section
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-surface rounded-2xl p-8 border border-outline-variant/20 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-5 flex items-center gap-3">
                <span className="w-1 h-6 rounded-full bg-[var(--color-secondary)] block" /> Deskripsi
              </h2>
              <div className="text-on-surface-variant leading-relaxed space-y-4 text-[15px] whitespace-pre-wrap">
                {project.description}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-on-surface mb-5 flex items-center gap-3">
                <span className="w-1 h-6 rounded-full bg-[var(--color-secondary)] block" /> Fitur Utama
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {features.map((feat: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 * i }}
                    className="bg-surface rounded-2xl p-5 border border-outline-variant/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                  >
                    <h4 className="font-bold text-on-surface mb-2">{feat.title || "Fitur"}</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{feat.desc || feat.description || ""}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* GALLERY */}
            {Array.isArray(project.gallery) && project.gallery.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-on-surface mb-5 flex items-center gap-3">
                  <span className="w-1 h-6 rounded-full bg-[var(--color-secondary)] block" /> Galeri & Dokumentasi
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {project.gallery.map((item: any, i: number) => (
                    <div key={i} className="rounded-2xl overflow-hidden border border-outline-variant/20 shadow-md bg-surface group flex flex-col transition-all duration-300 hover:shadow-lg">
                      <div className="overflow-hidden relative border-b border-outline-variant/10">
                        <img
                          src={typeof item === 'string' ? item : item.url}
                          alt={typeof item === 'object' && item.caption ? item.caption : `Dokumentasi ${i + 1}`}
                          className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      {typeof item === 'object' && item.caption && (
                        <div className="p-5 bg-gradient-to-b from-surface to-surface-variant/20 grow flex flex-col justify-center">
                          <p className="text-[14px] font-medium text-on-surface-variant leading-relaxed border-l-4 border-[var(--color-secondary)] pl-4">
                            {item.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
            
          </article>
        </div>
      </div>
    </main>
  );
}
