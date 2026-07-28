"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { FiPlus, FiTrash2, FiSend, FiArrowLeft, FiLoader, FiAlertCircle } from "react-icons/fi";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import ImageUpload from "@/components/ui/ImageUpload";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import TeamMemberAutocomplete from "@/components/upload/TeamMemberAutocomplete";

const KATEGORI_OPTIONS = [
  { id: "Technology", label: "Aplikasi Web & Sistem" },
  { id: "Programming", label: "Aplikasi Mobile" },
  { id: "Research", label: "Karya Tulis & Jurnal" },
  { id: "IoT", label: "Proyek IoT" },
  { id: "Multimedia", label: "Desain & Lainnya" },
  { id: "Community Service", label: "Pengabdian Masyarakat" }
];

const initialFormState = {
  title: "",
  category: "",
  description: "",
  image_url: "",
  tech_stack: "",
  github_url: "",
  live_url: "",
  features: [{ title: "", desc: "" }],
  team: [{ name: "", role: "", avatar: "", user_id: "" }],
  gallery: [{ url: "", caption: "" }] as { url: string; caption: string }[],
};

export default function UploadKaryaPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams?.get("type") || "Technology";
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [invalidField, setInvalidField] = useState<string | null>(null);
  const { toast } = useToast();

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  const [baseFormState, setBaseFormState] = useState(initialFormState);
  const [formData, setFormData] = useState(initialFormState);
  const [mahasiswaList, setMahasiswaList] = useState<any[]>([]);

  // Fetch Mahasiswa Profiles for Team Autocomplete & Auto-fill User
  useEffect(() => {
    const fetchMahasiswaAndUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from("mahasiswa_profiles").select("user_id, full_name, avatar_url");
      
      if (data) {
        setMahasiswaList(data);
        
        // Auto-fill Project Lead with current user if empty
        if (user) {
          const myProfile = data.find(m => m.user_id === user.id);
          if (myProfile) {
            const autoFilledTeam = [{ 
              name: myProfile.full_name, 
              role: "Project Lead", 
              avatar: myProfile.avatar_url, 
              user_id: myProfile.user_id 
            }];
            
            setBaseFormState(prev => ({ ...prev, team: autoFilledTeam }));

            setFormData(prev => {
              // Only override if the first member is still empty (e.g. no draft loaded)
              if (prev.team.length === 1 && prev.team[0].name === "") {
                return { ...prev, team: autoFilledTeam };
              }
              return prev;
            });
          }
        }
      }
    };
    fetchMahasiswaAndUser();
  }, [supabase]);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("karya_upload_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with defaults to handle old drafts missing new fields
        setFormData(prev => ({
          ...prev,
          ...parsed,
          gallery: Array.isArray(parsed.gallery) ? parsed.gallery : [],
          features: Array.isArray(parsed.features) && parsed.features.length > 0 ? parsed.features : prev.features,
          team: Array.isArray(parsed.team) && parsed.team.length > 0 ? parsed.team.map((t: any) => ({
            name: typeof t === 'string' ? t : (t.name || ''),
            role: typeof t === 'string' ? '' : (t.role || ''),
            avatar: typeof t === 'string' ? '' : (t.avatar || ''),
            user_id: typeof t === 'string' ? '' : (t.user_id || ''),
          })) : prev.team,
        }));
      } catch (e) {
        console.error("Failed to parse saved draft");
      }
    }
  }, []);

  // Dynamic labels based on type
  let isKTI = typeParam === "Research";
  let isLainnya = typeParam === "Multimedia";
  let techStackLabel = isKTI ? "Metodologi / Tools Penelitian *" : (typeParam === "IoT" ? "Komponen Hardware / Software *" : (isLainnya ? "Tools / Aplikasi yang Digunakan *" : "Tech Stack / Tools yang Digunakan *"));
  let techStackPlaceholder = isKTI ? "Contoh: SPSS, Studi Literatur, Kuantitatif..." : (typeParam === "IoT" ? "Contoh: ESP32, Arduino, Sensor Suhu, MQTT..." : (isLainnya ? "Contoh: Premiere Pro, Photoshop, Canva..." : "Contoh: React, Node.js, Figma..."));
  let liveUrlLabel = isKTI ? "Link Jurnal / Makalah (Google Drive) *" : (typeParam === "Programming" ? "Link Download / Play Store *" : (typeParam === "IoT" ? "Link Video Demo / Simulasi Wokwi *" : (isLainnya ? "Link Hasil Karya (YouTube / Google Drive) *" : "Live Demo / Website URL *")));
  let featuresLabel = isKTI ? "Temuan Utama / Poin Penting Penelitian *" : "Fitur Utama Karya *";
  let featuresDesc = isKTI ? "Jelaskan poin-poin penting atau temuan dari hasil penelitianmu." : "Jelaskan fitur-fitur penting yang ada di dalam karyamu agar orang lain mengerti fungsinya.";
  
  let showGithub = !isKTI && !isLainnya;

  // Auto-set Category based on URL typeParam
  useEffect(() => {
    if (typeParam) {
      setFormData(prev => ({ ...prev, category: typeParam }));
      setBaseFormState(prev => ({ ...prev, category: typeParam }));
    }
  }, [typeParam]);

  // Save to LocalStorage on change
  useEffect(() => {
    localStorage.setItem("karya_upload_draft", JSON.stringify(formData));
  }, [formData]);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(baseFormState);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleBackNavigation = (e: React.MouseEvent, url: string) => {
    if (isDirty) {
      e.preventDefault();
      setPendingUrl(url);
      setShowLeaveConfirm(true);
    }
  };

  const confirmLeave = () => {
    setShowLeaveConfirm(false);
    if (pendingUrl) {
      router.push(pendingUrl);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        window.location.href = '/login';
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFitur = (index: number, field: "title" | "desc", value: string) => {
    const updated = [...formData.features];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, features: updated }));
  };

  const handleTim = (index: number, field: "name" | "role" | "avatar" | "user_id", value: string) => {
    const updated = [...formData.team];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, team: updated }));
  };

  const addFitur = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, { title: "", desc: "" }] }));
  }

  const removeFitur = (index: number) => {
    setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  }

  const addAnggota = () => {
    setFormData(prev => ({ ...prev, team: [...prev.team, { name: "", role: "", avatar: "", user_id: "" }] }));
  };

  const removeAnggota = (index: number) => {
    setFormData(prev => ({ ...prev, team: prev.team.filter((_, i) => i !== index) }));
  };

  const addGallery = () => {
    setFormData(prev => ({ ...prev, gallery: [...prev.gallery, { url: "", caption: "" }] }));
  };

  const removeGallery = (index: number) => {
    setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));
  };

  const handleGallery = (index: number, field: "url" | "caption", value: string) => {
    const updated = [...formData.gallery];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, gallery: updated }));
  };

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInvalidField(null);

    const scrollToAndSetInvalid = (id: string, msg: string) => {
      setInvalidField(id);
      toast(msg, "error");
      document.getElementById(id)?.focus();
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    if (!formData.image_url) {
      setInvalidField("section-image");
      toast("Foto Utama Karya wajib diupload!", "error");
      document.getElementById("section-image")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    
    if (!formData.title.trim()) return scrollToAndSetInvalid("input-title", "Judul Karya wajib diisi!");
    if (!formData.category) return scrollToAndSetInvalid("input-category", "Kategori wajib dipilih!");
    if (!formData.description.trim()) return scrollToAndSetInvalid("input-description", "Deskripsi/Abstrak wajib diisi!");
    if (!formData.tech_stack.trim()) return scrollToAndSetInvalid("input-tech-stack", "Tools / Metodologi wajib diisi!");
    
    if (formData.github_url.trim() && !isValidUrl(formData.github_url.trim())) return scrollToAndSetInvalid("input-github-url", "Format GitHub URL tidak valid!");
    
    if (!formData.live_url.trim()) return scrollToAndSetInvalid("input-live-url", "Link Utama Karya wajib diisi!");
    else if (!isValidUrl(formData.live_url.trim())) return scrollToAndSetInvalid("input-live-url", "Format Link Utama URL tidak valid!");
    
    if (!isLainnya) {
      const validFeatures = formData.features.filter(f => f.title.trim() !== "" && f.desc.trim() !== "");
      if (validFeatures.length === 0) return scrollToAndSetInvalid("input-feature-0-title", `Minimal 1 ${isKTI ? "Temuan Utama" : "Fitur Utama"} harus diisi (Judul & Deskripsi)!`);
    }

    const validTeam = formData.team.filter(t => t.name.trim() !== "" && t.role.trim() !== "");
    if (validTeam.length === 0) return scrollToAndSetInvalid("input-team-0-name", "Minimal 1 Anggota Tim harus diisi (Nama & Peran)!");

    const validGallery = formData.gallery.filter(g => g.url.trim() !== "");
    if (validGallery.length === 0) return scrollToAndSetInvalid("input-gallery-0-url", "Minimal 1 Foto Dokumentasi wajib diupload!");

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Anda harus login untuk upload karya.");

      const techStackArray = formData.tech_stack.split(',').map(item => item.trim()).filter(Boolean);
      const teamObjects = formData.team
        .filter(t => t.name.trim() !== "")
        .map(t => ({ name: t.name, role: t.role, avatar: t.avatar || "", user_id: t.user_id || undefined }));

      const { error } = await supabase.from('karya').insert({
        user_id: user.id,
        title: formData.title,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6),
        category: formData.category,
        description: formData.description,
        tech_stack: techStackArray,
        github_url: formData.github_url || null,
        live_url: formData.live_url || null,
        team: teamObjects,
        features: formData.features.filter(f => f.title.trim() !== ""),
        gallery: formData.gallery.filter(g => g.url.trim() !== ""),
        status: 'pending',
        image_url: formData.image_url,
      });

      if (error) throw error;
      localStorage.removeItem("karya_upload_draft");
      toast("Karya berhasil diajukan! Silakan tunggu review dari BEM.", "success");

      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] });

      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000);
      
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Terjadi kesalahan saat upload karya.");
      setIsLoading(false);
    }
  };

  const getInputClass = (id: string) => `w-full px-4 py-3 bg-surface-variant/20 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
    invalidField === id 
      ? "border-red-500 focus:ring-red-500/40 focus:border-red-500 bg-red-50/50" 
      : "border-outline-variant/30 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)]"
  }`;
  const labelClass = "block text-sm font-semibold text-on-surface mb-1.5";

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/dashboard" onClick={(e) => handleBackNavigation(e, "/dashboard")} className="inline-flex items-center gap-2 text-on-surface-variant hover:text-[var(--color-primary)] transition-colors text-sm font-medium mb-4">
            <FiArrowLeft /> Kembali ke Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-[var(--color-primary)] mb-2">
            Upload Karya Baru
          </h1>
          <p className="text-on-surface-variant">
            Lengkapi formulir di bawah ini untuk mengajukan karyamu agar dapat direview oleh BEM.
          </p>
        </div>

        <form noValidate onSubmit={handleSubmit} className="bg-surface p-6 md:p-8 rounded-3xl shadow-sm border border-outline-variant/20 space-y-8">
          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <div id="section-image">
            <h3 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-[var(--color-secondary)] rounded-full block" /> Foto Utama Karya <span className="text-red-400 normal-case">*</span>
            </h3>
            <div className={`mb-2 p-1 rounded-[1.25rem] transition-all ${invalidField === 'section-image' ? 'border-2 border-red-500 bg-red-50/50 shadow-[0_0_0_4px_rgba(239,68,68,0.15)]' : 'border-2 border-transparent'}`}>
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => { setFormData(prev => ({ ...prev, image_url: url })); if(invalidField === 'section-image') setInvalidField(null); }}
              />
            </div>
            <p className="text-xs text-on-surface-variant mt-1 px-1">Format: JPG/PNG, maksimal 2MB.</p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-[var(--color-secondary)] rounded-full block" /> Informasi Utama
            </h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Judul Karya <span className="text-red-400">*</span></label>
                <input id="input-title" name="title" type="text" value={formData.title} onChange={handleInput} placeholder="Contoh: Smart Campus Navigation System" className={getInputClass("input-title")} />
              </div>
              <div>
                <label className={labelClass}>Kategori <span className="text-red-400">*</span></label>
                <select id="input-category" name="category" value={formData.category} onChange={handleInput} className={`${getInputClass("input-category")} !bg-surface-variant/60 !text-on-surface-variant/70 cursor-not-allowed`} disabled>
                  <option value="" disabled>Pilih Kategori...</option>
                  {KATEGORI_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                </select>
                <p className="text-xs text-on-surface-variant mt-2 font-medium">Kategori otomatis disesuaikan dengan pilihanmu di awal.</p>
              </div>
              <div>
                <label className={labelClass}>Deskripsi Singkat / Abstrak <span className="text-red-400">*</span></label>
                <textarea id="input-description" name="description" rows={4} value={formData.description} onChange={handleInput} placeholder="Jelaskan latar belakang, tujuan, dan hasil dari proyekmu..." className={`${getInputClass("input-description")} resize-none`} />
              </div>
            </div>
          </div>

          <div id="section-tech">
            <h3 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-[var(--color-secondary)] rounded-full block" /> Tech Stack & Tautan
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="input-tech-stack" className={labelClass}>{techStackLabel}</label>
                <input id="input-tech-stack" type="text" value={formData.tech_stack} onChange={(e) => setFormData(prev => ({ ...prev, tech_stack: e.target.value }))} placeholder={techStackPlaceholder} className={getInputClass("input-tech-stack")} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="input-live-url" className={labelClass}>{liveUrlLabel}</label>
                  <input id="input-live-url" type="url" value={formData.live_url} onChange={(e) => setFormData(prev => ({ ...prev, live_url: e.target.value }))} placeholder="https://..." className={getInputClass("input-live-url")} />
                </div>
                {showGithub && (
                  <div>
                    <label htmlFor="input-github-url" className={labelClass}>GitHub Repository (Opsional)</label>
                    <input id="input-github-url" type="url" value={formData.github_url} onChange={(e) => setFormData(prev => ({ ...prev, github_url: e.target.value }))} placeholder="https://github.com/..." className={getInputClass("input-github-url")} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {!isLainnya && (
            <div id="section-features">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-4 bg-[var(--color-secondary)] rounded-full block" /> {featuresLabel}
                </h3>
                <button type="button" onClick={addFitur} className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors">
                  <FiPlus size={14} /> Tambah {isKTI ? "Poin" : "Fitur"}
                </button>
              </div>
              <p className="text-xs text-on-surface-variant mb-4">{featuresDesc}</p>
              <div className="space-y-3">
                {formData.features.map((fitur, i) => (
                  <div key={i} className="bg-surface-variant/20 rounded-2xl p-4 border border-outline-variant/20">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wide">{isKTI ? "Poin" : "Fitur"} {i + 1}</p>
                      {i > 0 && <button type="button" onClick={() => removeFitur(i)} className="text-gray-300 hover:text-red-400 transition-colors"><FiTrash2 size={14} /></button>}
                    </div>
                    <div className="flex-1 space-y-3">
                      <input type="text" value={fitur.title} onChange={(e) => handleFitur(i, "title", e.target.value)} placeholder={`Judul ${isKTI ? "poin" : "fitur"}...`} className={getInputClass(`input-feature-${i}-title`)} id={`input-feature-${i}-title`} />
                      <textarea rows={2} value={fitur.desc} onChange={(e) => handleFitur(i, "desc", e.target.value)} placeholder="Deskripsi..." className={`${getInputClass("")} resize-none`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-[var(--color-secondary)] rounded-full block" /> Anggota Tim <span className="text-red-400 normal-case">*</span>
              </h3>
              {formData.team.length < 5 && <button type="button" onClick={addAnggota} className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors"><FiPlus size={14} /> Tambah Anggota</button>}
            </div>
            <div className="space-y-3">
              {formData.team.map((anggota, i) => (
                <div key={i} className="bg-surface-variant/20 rounded-2xl p-4 border border-outline-variant/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wide">{i === 0 ? "Project Lead" : `Anggota ${i + 1}`}</p>
                    {i > 0 && <button type="button" onClick={() => removeAnggota(i)} className="text-gray-300 hover:text-red-400 transition-colors"><FiTrash2 size={14} /></button>}
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 flex flex-col items-center gap-1">
                      {anggota.user_id ? (
                        <div className="aspect-square w-16 sm:w-20 rounded-xl overflow-hidden border border-outline-variant/30 bg-surface flex items-center justify-center opacity-80 cursor-not-allowed">
                          {anggota.avatar ? <img src={anggota.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-xl">{anggota.name.charAt(0) || 'U'}</div>}
                        </div>
                      ) : (
                        <ImageUpload value={anggota.avatar || ""} onChange={(url) => handleTim(i, "avatar", url)} />
                      )}
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <TeamMemberAutocomplete value={anggota.name} mahasiswaList={mahasiswaList} onChange={(name, user_id, avatar) => { const u = [...formData.team]; u[i].name = name; if(user_id !== undefined) u[i].user_id = user_id; if(avatar !== undefined) u[i].avatar = avatar; setFormData(prev => ({ ...prev, team: u })); }} placeholder="Nama Lengkap..." disabled={i === 0} />
                      <input type="text" value={anggota.role} onChange={e => handleTim(i, "role", e.target.value)} placeholder="Peran" className={getInputClass("")} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-[var(--color-secondary)] rounded-full block" /> Galeri Dokumentasi <span className="text-red-400 normal-case">*</span>
              </h3>
              {formData.gallery.length < 10 && <button type="button" onClick={addGallery} className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors"><FiPlus size={14} /> Tambah Foto</button>}
            </div>
            <div className="space-y-3">
              {formData.gallery.map((gal, i) => (
                <div key={i} className="rounded-2xl p-4 border border-outline-variant/20 bg-surface-variant/20 flex flex-col sm:flex-row gap-4 items-start">
                  <div className="shrink-0"><ImageUpload value={gal.url} onChange={(url) => handleGallery(i, "url", url)} /></div>
                  <div className="flex-1 flex flex-col gap-3 justify-center">
                    <div className="flex items-center justify-between"><p className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wide">Foto {i + 1}</p><button type="button" onClick={() => removeGallery(i)} className="text-gray-300 hover:text-red-400 transition-colors"><FiTrash2 size={14} /></button></div>
                    <input type="text" value={gal.caption} onChange={e => handleGallery(i, "caption", e.target.value)} placeholder="Keterangan..." className={getInputClass("")} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/20">
            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2.5 py-4 bg-[var(--color-primary)] text-white font-extrabold rounded-2xl hover:bg-[var(--color-primary)]/90 transition-all text-sm disabled:opacity-70">
              {isLoading ? <FiLoader className="animate-spin" size={18} /> : <FiSend size={18} />}
              {isLoading ? 'Mengirim Data...' : 'Kirim Pengajuan Karya'}
            </button>
          </div>
        </form>
      </div>

      <AnimatePresence>
        {showLeaveConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-surface rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-outline-variant/20">
              <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4"><FiAlertCircle size={28} /></div>
              <h3 className="text-xl font-bold text-on-surface mb-2">Perubahan Belum Disimpan</h3>
              <p className="text-on-surface-variant text-sm mb-8">Apakah kamu yakin ingin keluar? Perubahan tidak akan tersimpan.</p>
              <div className="flex w-full gap-3">
                <button
                  type="button"
                  onClick={() => setShowLeaveConfirm(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-on-surface bg-surface-variant hover:bg-outline-variant transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmLeave}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Ya, Keluar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
