"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FiArrowLeft, FiHeart, FiEye, FiGithub, FiExternalLink,
  FiCalendar, FiTag, FiShare2, FiArrowRight
} from "react-icons/fi";
import { motion } from "framer-motion";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { getDeviceId } from "@/utils/identity";
import { getTechStack } from "@/lib/techStack";
import { getKTITool } from "@/lib/ktiTools";
import { getIoTComponent } from "@/lib/iotComponents";
import { getMultimediaTool } from "@/lib/multimediaTools";
import MahasiswaProfileDrawer from "@/components/mahasiswa/MahasiswaProfileDrawer";
import { MahasiswaProfile } from "@/components/mahasiswa/MahasiswaCard";
import { ProjectData } from "@/components/mahasiswa/ProjectCard";

const categoryColors: Record<string, string> = {
  TECHNOLOGY: "bg-blue-100 text-blue-700",
  "UI/UX": "bg-purple-100 text-purple-700",
  RESEARCH: "bg-green-100 text-green-700",
  PROGRAMMING: "bg-orange-100 text-orange-700",
  MULTIMEDIA: "bg-yellow-100 text-yellow-700",
  IOT: "bg-teal-100 text-teal-700",
};

const CATEGORY_MAP: Record<string, string> = {
  "Technology": "Aplikasi Web & Sistem",
  "Programming": "Aplikasi Mobile",
  "Research": "Karya Tulis & Jurnal",
  "IoT": "Proyek IoT",
  "Multimedia": "Desain & Lainnya",
};

const getCategoryLabel = (id: string) => CATEGORY_MAP[id] || id;

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

  const [selectedMahasiswa, setSelectedMahasiswa] = useState<MahasiswaProfile | null>(null);
  const [selectedMahasiswaProjects, setSelectedMahasiswaProjects] = useState<ProjectData[]>([]);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);

  const handleOpenProfile = async (userId: string) => {
    if (!userId || isFetchingProfile) return;
    setIsFetchingProfile(true);
    
    try {
      const { data: profileData, error: profileErr } = await supabase
        .from('mahasiswa_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (profileErr || !profileData) {
        toast("Profil tidak ditemukan atau belum dilengkapi.", "error");
        setIsFetchingProfile(false);
        return;
      }
      
      const { data: projectsData, error: projectsErr } = await supabase
        .from('karya')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'approved');
        
      let mappedProjects: ProjectData[] = [];
      if (!projectsErr && projectsData) {
        mappedProjects = projectsData.map((p: any) => ({
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
        }));
      }

      setSelectedMahasiswaProjects(mappedProjects);
      setSelectedMahasiswa(profileData);
    } catch (err) {
      toast("Terjadi kesalahan saat memuat profil.", "error");
    } finally {
      setIsFetchingProfile(false);
    }
  };

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

  const isKTI = project.category === "Research";

  // Handle Team (fallback to creator if empty)
  const team = Array.isArray(project.team) && project.team.length > 0 
    ? project.team 
    : [{ name: "Kreator", role: "Project Lead" }];

  // Parse team members – format bisa "Name (Role)" string atau object {name, role, avatar}
  const parsedTeam = team.map((member: any, i: number) => {
    if (typeof member === 'string') {
      const match = member.match(/^(.+?)\s*\((.+)\)$/);
      return match ? { name: match[1].trim(), role: match[2].trim(), avatar: '', user_id: i === 0 ? project.user_id : '' } : { name: member, role: 'Anggota Tim', avatar: '', user_id: i === 0 ? project.user_id : '' };
    }
    return { name: member.name || 'Anggota', role: member.role || 'Tim', avatar: member.avatar || '', user_id: member.user_id || (i === 0 ? project.user_id : '') };
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

        <motion.div whileHover={{ x: -3 }} className="absolute top-6 left-6 md:left-10 z-20">
          <Link
            href="/karya"
            className="flex items-center gap-2 text-white/90 hover:text-white bg-black/30 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
          >
            <FiArrowLeft size={15} /> Semua Karya
          </Link>
        </motion.div>

        <div className="absolute top-6 right-6 md:right-10 z-20">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-xs font-bold px-3 py-1.5 rounded-full ${categoryColors[project.category?.toUpperCase()] ?? "bg-surface/20 text-white"} backdrop-blur-sm`}
          >
            {getCategoryLabel(project.category)}
          </motion.span>
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
          <motion.aside
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Like + Share */}
            <div className="bg-surface rounded-2xl p-5 border border-outline-variant/20 shadow-sm flex gap-3">
              <motion.button
                onClick={handleToggleLike}
                disabled={isLiking}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-300 border ${liked ? "bg-red-50 border-red-200 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]" : "border-outline-variant/30 text-on-surface-variant hover:border-red-200 hover:text-red-400 hover:bg-red-50/50"} ${isLiking ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                <div className="w-6 h-6 flex items-center justify-center -ml-1 shrink-0">
                  {liked ? (
                    <DotLottieReact src="/animations/Heart Animated.lottie" autoplay loop={false} />
                  ) : (
                    <FiHeart size={16} />
                  )}
                </div>
                {likeCount.toLocaleString()}
              </motion.button>
              <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95, rotate: -5 }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-300 border border-outline-variant/30 text-on-surface-variant hover:border-primary/40 hover:text-primary hover:bg-primary/5"
              >
                <FiShare2 size={16} /> Bagikan
              </motion.button>
            </div>

            {/* Links */}
            {(project.github_url || project.live_url) && (
              <div className="bg-surface rounded-2xl p-5 border border-outline-variant/20 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-on-surface-variant/70 uppercase tracking-wider">Tautan</h3>
                {project.github_url && (
                  <motion.a
                    href={project.github_url} target="_blank" rel="noopener noreferrer"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative overflow-hidden group/btn flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold transition-all shadow-sm hover:shadow-lg"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '200%' }}
                      transition={{ duration: 0.6 }}
                    />
                    <FiGithub size={16} /> Repositori GitHub
                    <FiArrowRight size={13} className="ml-auto opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                  </motion.a>
                )}
                {project.live_url && (
                  <motion.a
                    href={project.live_url} target="_blank" rel="noopener noreferrer"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative overflow-hidden group/btn flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold transition-all shadow-sm hover:shadow-lg hover:shadow-primary/25"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -skew-x-12"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '200%' }}
                      transition={{ duration: 0.6 }}
                    />
                    <FiExternalLink size={16} />
                    {isKTI ? "Link Jurnal / Makalah" : "Live Demo"}
                    <FiArrowRight size={13} className="ml-auto opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                  </motion.a>
                )}
              </div>
            )}

            {/* Team */}
            <div className="bg-surface rounded-2xl p-5 border border-outline-variant/20 shadow-sm">
              <h3 className="text-sm font-bold text-on-surface-variant/70 uppercase tracking-wider mb-4">Tim Pembuat</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {parsedTeam.map((member: any, i: number) => {
                  const initials = (member.name || 'U').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                  const isClickable = !!member.user_id;
                  
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      whileHover={isClickable ? { scale: 1.02, y: -2 } : {}}
                      whileTap={isClickable ? { scale: 0.98 } : {}}
                      onClick={isClickable ? () => handleOpenProfile(member.user_id) : undefined}
                      className={`relative group/card overflow-hidden rounded-xl border p-3 transition-all duration-300 ${
                        isClickable
                          ? 'border-primary/30 hover:border-primary/70 hover:shadow-[0_4px_20px_rgba(27,64,134,0.15)] cursor-pointer bg-surface-variant/10 hover:bg-primary/5'
                          : 'border-outline-variant/20 bg-surface-variant/10'
                      }`}
                    >
                      {isClickable && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/70 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                      )}
                      <div className="flex items-center gap-3">
                        <div className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden shadow-sm border-2 transition-all duration-300 ${
                          isClickable
                            ? 'bg-gradient-to-br from-primary/80 to-secondary/80 text-white border-white/50 group-hover/card:shadow-md group-hover/card:border-primary/40'
                            : 'bg-gradient-to-br from-surface-variant to-outline-variant/50 text-on-surface-variant border-outline-variant/20'
                        }`}>
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                          ) : initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm truncate transition-colors duration-200 ${isClickable ? 'text-primary' : 'text-on-surface'}`}>{member.name}</p>
                          <p className="text-[10px] text-secondary font-bold uppercase tracking-wider mt-0.5 truncate">{member.role}</p>
                        </div>
                        {isClickable && (
                          <div className="shrink-0 translate-x-2 opacity-0 group-hover/card:translate-x-0 group-hover/card:opacity-100 transition-all duration-300">
                            {isFetchingProfile ? (
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-lg whitespace-nowrap">
                                Lihat <FiArrowRight size={9} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Tech Stack / Metodologi */}
            {project.tech_stack && project.tech_stack.length > 0 && (
              <div className="bg-surface rounded-2xl p-5 border border-outline-variant/20 shadow-sm">
                <h3 className="text-sm font-bold text-on-surface-variant/70 uppercase tracking-wider mb-4">
                  {isKTI ? "Metodologi / Tools" : "Tech Stack"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack.map((t: string) => {
                    // Coba KTI tools dulu, lalu IoT, lalu Multimedia, lalu techStack biasa
                    const isIoT = project.category === "IoT";
                    const isMultimedia = project.category === "Multimedia";
                    const ktiDef = isKTI ? getKTITool(t) : undefined;
                    const iotDef = isIoT ? getIoTComponent(t) : undefined;
                    const multiDef = isMultimedia ? getMultimediaTool(t) : undefined;
                    const techDef = (!ktiDef && !iotDef && !multiDef) ? getTechStack(t) : undefined;
                    const def = ktiDef ?? iotDef ?? multiDef ?? techDef;

                    if (def) {
                      const Icon = def.icon;
                      return (
                        <motion.span
                          key={t}
                          whileHover={{ scale: 1.08, y: -2 }}
                          className="flex items-center gap-1.5 px-3 py-1.5 border text-xs font-bold rounded-full cursor-default transition-shadow hover:shadow-md"
                          style={{ backgroundColor: `${def.color}10`, color: def.color, borderColor: `${def.color}30` }}
                        >
                          <Icon size={12} /> {def.label}
                        </motion.span>
                      );
                    }
                    return (
                      <motion.span key={t} whileHover={{ scale: 1.08 }} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/10 text-primary text-xs font-bold rounded-full">
                        <FiTag size={10} /> {t}
                      </motion.span>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.aside>

          {/* ── MAIN ARTICLE ─────────────────────────────── */}
          <motion.article
            className="lg:col-span-2 space-y-10"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            {/* Description / Abstrak */}
            <motion.section
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-surface rounded-2xl p-8 border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-5 flex items-center gap-3">
                <span className="w-1 h-6 rounded-full bg-[var(--color-secondary)] block" />
                {isKTI ? "Abstrak" : "Deskripsi"}
              </h2>
              <div className="text-on-surface-variant leading-relaxed space-y-4 text-[15px] whitespace-pre-wrap">
                {project.description}
              </div>
            </motion.section>

            {/* Features / Temuan */}
            <motion.section
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-on-surface mb-5 flex items-center gap-3">
                <span className="w-1 h-6 rounded-full bg-[var(--color-secondary)] block" />
                {isKTI ? "Temuan & Poin Penting" : "Fitur Utama"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {features.map((feat: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * i }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-surface rounded-2xl p-5 border border-outline-variant/20 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-default"
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <span className="text-primary font-bold text-sm">{i + 1}</span>
                    </div>
                    <h4 className="font-bold text-on-surface mb-2">{feat.title || "Fitur"}</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{feat.desc || feat.description || ""}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Gallery */}
            {Array.isArray(project.gallery) && project.gallery.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-on-surface mb-5 flex items-center gap-3">
                  <span className="w-1 h-6 rounded-full bg-[var(--color-secondary)] block" /> Galeri & Dokumentasi
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {project.gallery.map((item: any, i: number) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02, y: -3 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="rounded-2xl overflow-hidden border border-outline-variant/20 shadow-md bg-surface group flex flex-col hover:shadow-xl hover:border-primary/20 transition-all duration-300"
                    >
                      <div className="overflow-hidden relative border-b border-outline-variant/10">
                        <img
                          src={typeof item === 'string' ? item : item.url}
                          alt={typeof item === 'object' && item.caption ? item.caption : `Dokumentasi ${i + 1}`}
                          className="w-full aspect-video object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-3">
                            <FiEye className="text-white" size={20} />
                          </div>
                        </div>
                      </div>
                      {typeof item === 'object' && item.caption && (
                        <div className="p-5 bg-gradient-to-b from-surface to-surface-variant/20 grow flex flex-col justify-center">
                          <p className="text-[14px] font-medium text-on-surface-variant leading-relaxed border-l-4 border-[var(--color-secondary)] pl-4">
                            {item.caption}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
            
          </motion.article>
        </div>
      </div>

      <MahasiswaProfileDrawer
        mahasiswa={selectedMahasiswa}
        projects={selectedMahasiswaProjects}
        onClose={() => setSelectedMahasiswa(null)}
      />
    </main>
  );
}
