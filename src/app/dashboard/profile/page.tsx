"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { FiSave, FiUser, FiInfo, FiLink, FiGithub, FiLinkedin, FiInstagram, FiGlobe, FiAlertCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { compressImage } from "@/lib/imageCompression";

export default function ProfileSettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  // true = prodi & angkatan sudah diset admin (read-only untuk user)
  // false = belum diinput admin, user bisa isi prodi & angkatan sendiri
  const [isAdminSeeded, setIsAdminSeeded] = useState(false);
  
  const DRAFT_KEY = "profile_draft";

  const [formData, setFormData] = useState({
    full_name: "",
    contact_email: "",
    prodi: "Teknik Informatika",
    angkatan: 2,
    bio: "",
    status_badge: "🚀 Open for Collab",
    github_url: "",
    linkedin_url: "",
    instagram_url: "",
    website_url: "",
    skills: "",
    avatar_url: ""
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const PRODI_OPTIONS = [
    "Teknik Informatika",
    "Sistem Informasi",
    "Bisnis Digital"
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);

      const defaultName = user.user_metadata?.full_name || "";

      // Langkah 1: Cek draft di localStorage DULU, tampilkan segera
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setFormData(draft);
          setIsDirty(true);
        } catch {
          localStorage.removeItem(DRAFT_KEY);
        }
      }

      // Langkah 2: Fetch dari DB (sumber kebenaran untuk field read-only)
      let { data, error } = await supabase
        .from('mahasiswa_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Jika tidak ketemu berdasarkan user_id, coba cari berdasarkan email kampus (Data dari Admin)
      if (error && error.code === 'PGRST116') {
        const { data: emailData, error: emailError } = await supabase
          .from('mahasiswa_profiles')
          .select('*')
          .eq('email', user.email)
          .is('user_id', null)
          .single();

        if (emailData && !emailError) {
          // Ketemu data admin! Langsung klaim (auto-link) profil ini dengan user_id sekarang
          await supabase.from('mahasiswa_profiles').update({ user_id: user.id }).eq('id', emailData.id);
          data = { ...emailData, user_id: user.id };
          error = null;
          setIsAdminSeeded(true); // Prodi & angkatan dari admin → read-only
        }
      }

      if (data && !error) {
        // Data ditemukan (dari admin atau login sebelumnya)
        setIsAdminSeeded(true); // Prodi & angkatan dari admin → read-only
        const dbData = {
          full_name: data.full_name || defaultName,
          contact_email: data.contact_email || "",
          prodi: data.prodi || "Teknik Informatika",
          angkatan: data.angkatan || 2,
          bio: data.bio || "",
          status_badge: data.status_badge || "🚀 Open for Collab",
          github_url: data.github_url || "",
          linkedin_url: data.linkedin_url || "",
          instagram_url: data.instagram_url || "",
          website_url: data.website_url || "",
          skills: data.skills ? data.skills.join(", ") : "",
          avatar_url: data.avatar_url || ""
        };

        if (savedDraft) {
          // Ada draft: pakai draft untuk field yang bisa diedit,
          // tapi SELALU pakai DB untuk nama (dari Google) dan prodi & angkatan (dari admin)
          try {
            const draft = JSON.parse(savedDraft);
            setFormData({
              ...draft,
              full_name: dbData.full_name, // selalu dari Google/admin
              prodi: dbData.prodi,         // selalu dari admin
              angkatan: dbData.angkatan    // selalu dari admin
            });
          } catch {
            setFormData(dbData);
          }
        } else {
          // Tidak ada draft: pakai data dari DB
          setFormData(dbData);
        }

        if (data.avatar_url) {
          setAvatarPreview(data.avatar_url);
        }
      } else {
        // Belum ada profil sama sekali → auto-insert profil minimal dengan nama Google
        setIsAdminSeeded(false); // Prodi & angkatan belum dari admin → user bisa isi
        const minimalProfile = {
          user_id: user.id,
          full_name: defaultName,
          email: user.email || "",
          prodi: "",
          angkatan: 1,
          skills: [],
        };
        await supabase
          .from('mahasiswa_profiles')
          .insert([minimalProfile]);

        // Set form: nama dari Google (read-only), prodi & angkatan kosong untuk diisi user
        const draftData = savedDraft ? (() => { try { return JSON.parse(savedDraft); } catch { return {}; } })() : {};
        setFormData(prev => ({
          ...prev,
          prodi: draftData.prodi || "",
          angkatan: draftData.angkatan || "" as any,
          ...draftData,
          // nama selalu dari Google
          full_name: defaultName,
        }));
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  // Simpan draft ke localStorage setiap kali formData berubah dan isDirty
  useEffect(() => {
    if (isDirty) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    }
  }, [formData, isDirty, loading]);

  // Peringatan saat akan meninggalkan halaman dengan perubahan belum disimpan
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const uploadAvatarToSupabase = async (file: File): Promise<string | null> => {
    try {
      // Kompres file sebelum upload (max 1MB, dimensi max 1024px krn hnya avatar)
      const compressedFile = await compressImage(file, 1, 1024);

      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public_images')
        .upload(filePath, compressedFile);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('public_images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (!isDirty && !avatarFile) {
      toast.info("Tidak Ada Perubahan: Anda belum mengubah data apapun.");
      return;
    }
    
    setSaving(true);
    
    let finalAvatarUrl = formData.avatar_url;
    if (avatarFile) {
      setUploadingAvatar(true);
      const uploadedUrl = await uploadAvatarToSupabase(avatarFile);
      if (uploadedUrl) {
        finalAvatarUrl = uploadedUrl;
      }
      setUploadingAvatar(false);
    }
    
    // Parse skills dari string (pisahkan dengan koma) menjadi array
    const skillsArray = formData.skills
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const payload = {
      user_id: userId,
      full_name: formData.full_name,
      contact_email: formData.contact_email,
      prodi: formData.prodi,
      angkatan: parseInt(formData.angkatan.toString()) || 2,
      bio: formData.bio || "Halo! Saya mahasiswa BEM STMIK Tazkia.",
      status_badge: formData.status_badge,
      github_url: formData.github_url,
      linkedin_url: formData.linkedin_url,
      instagram_url: formData.instagram_url,
      website_url: formData.website_url,
      skills: skillsArray,
      avatar_url: finalAvatarUrl,
      email: (await supabase.auth.getUser()).data.user?.email || "unknown@tazkia.ac.id"
    };

    // Upsert: Cek berdasarkan user_id dulu
    let { data: existing } = await supabase
      .from('mahasiswa_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
      
    // Jika masih null, cek berdasarkan email (berjaga-jaga kalau belum ter-link)
    if (!existing) {
      const { data: byEmail } = await supabase
        .from('mahasiswa_profiles')
        .select('id')
        .eq('email', payload.email)
        .is('user_id', null)
        .single();
        
      if (byEmail) existing = byEmail;
    }

    let error;
    
    if (existing) {
      // Update
      const res = await supabase.from('mahasiswa_profiles').update(payload).eq('id', existing.id);
      error = res.error;
    } else {
      // Insert
      const res = await supabase.from('mahasiswa_profiles').insert([payload]);
      error = res.error;
    }

    if (error) {
      toast.error("Gagal Menyimpan: " + error.message);
    } else {
      // Berhasil simpan: hapus draft & reset dirty flag
      localStorage.removeItem(DRAFT_KEY);
      setIsDirty(false);
      toast.success("Berhasil Disimpan: Profilmu sudah diperbarui!");
      router.refresh();
    }
    
    setSaving(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-on-surface-variant">Memuat profil...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
          <FiUser className="text-[var(--color-primary)]" />
          Sesuaikan Profilmu
        </h1>
        <p className="text-on-surface-variant mt-1 text-sm">
          Lengkapi data dirimu agar profilmu tampil profesional di halaman Showcase Mahasiswa.
        </p>
      </div>

      {/* Banner Perubahan Belum Disimpan */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800"
          >
            <FiAlertCircle className="text-amber-500 shrink-0" size={18} />
            <p className="text-sm font-medium">Ada perubahan yang belum disimpan. Simpan sekarang agar tidak hilang.</p>
            <button
              onClick={() => {
                localStorage.removeItem(DRAFT_KEY);
                setIsDirty(false);
                router.refresh();
              }}
              className="ml-auto text-xs text-amber-600 hover:text-amber-800 underline shrink-0"
            >
              Batalkan
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
        
        {/* Avatar Upload */}
        <div className="p-6 border-b border-outline-variant/20 flex flex-col items-center justify-center gap-4 bg-surface-variant/5">
          <div className="relative w-32 h-32 rounded-full border-4 border-surface shadow-md overflow-hidden bg-primary/10 flex items-center justify-center">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
            ) : (
              <FiUser size={48} className="text-primary/50" />
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="text-center">
            <label className="cursor-pointer px-4 py-2 bg-surface border border-outline-variant/30 rounded-full text-sm font-bold text-primary hover:bg-primary/5 transition-colors inline-block">
              Pilih Foto Profil
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={uploadingAvatar || saving}
              />
            </label>
            <p className="text-xs text-on-surface-variant mt-2">
              Disarankan rasio 1:1, max 2MB
            </p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="p-6 border-b border-outline-variant/20 space-y-6 bg-surface-variant/5">
          <h2 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider flex items-center gap-2">
            <FiInfo /> Informasi Dasar
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nama Lengkap - Selalu read-only, otomatis dari akun Google kampus */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                Nama Lengkap
                <span className="text-xs font-normal text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded-full">Dari akun Google</span>
              </label>
              <input
                type="text"
                value={formData.full_name}
                readOnly
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-variant/40 text-on-surface-variant cursor-not-allowed outline-none"
              />
            </div>
            
            {/* NIM diganti Email Kontak - Bisa diisi */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                Email Kontak
                <span className="text-xs font-normal text-on-surface-variant bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">💡 Disarankan email pribadi</span>
              </label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary bg-surface outline-none transition-all"
                placeholder="Misal: namakamu@gmail.com"
              />
              <p className="text-xs text-on-surface-variant">Email ini yang akan dihubungi saat orang mengklik tombol kolaborasi di profilmu.</p>
            </div>
            
            {/* Program Studi - Read Only jika dari admin, pilih sendiri jika belum */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                Program Studi
                {isAdminSeeded ? (
                  <span className="text-xs font-normal text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded-full">Tidak dapat diubah</span>
                ) : (
                  <span className="text-xs font-normal text-primary bg-primary/10 px-2 py-0.5 rounded-full">Pilih prodimu</span>
                )}
              </label>
              {isAdminSeeded ? (
                <input
                  type="text"
                  value={formData.prodi}
                  readOnly
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-variant/40 text-on-surface-variant cursor-not-allowed outline-none"
                />
              ) : (
                <select
                  name="prodi"
                  value={formData.prodi}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary bg-surface outline-none transition-all"
                >
                  <option value="" disabled>-- Pilih Program Studi --</option>
                  <option value="Teknik Informatika">Teknik Informatika</option>
                  <option value="Sistem Informasi">Sistem Informasi</option>
                  <option value="Bisnis Digital">Bisnis Digital</option>
                </select>
              )}
            </div>
            
            {/* Tahun Angkatan - Read Only jika dari admin, isi sendiri jika belum */}
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2 flex items-center gap-2">
                Angkatan
                {isAdminSeeded ? (
                  <span className="text-[10px] bg-surface-variant/50 text-on-surface-variant px-2 py-0.5 rounded-full">Tidak dapat diubah</span>
                ) : (
                  <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">Isi angkatanmu</span>
                )}
              </label>
              <input
                type="number"
                name="angkatan"
                value={formData.angkatan}
                onChange={isAdminSeeded ? undefined : handleChange}
                disabled={isAdminSeeded}
                required={!isAdminSeeded}
                min={1}
                placeholder={isAdminSeeded ? "" : "Contoh: 1, 2, 3..."}
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                  isAdminSeeded
                    ? "bg-surface-variant/20 border-outline-variant/30 text-on-surface-variant cursor-not-allowed"
                    : "bg-surface border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary"
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-on-surface">Bio Singkat</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary bg-surface outline-none transition-all resize-none"
              placeholder="Tuliskan sedikit tentang dirimu, minat, dan passion-mu..."
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-on-surface">Keahlian (Skills)</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary bg-surface outline-none transition-all"
              placeholder="Misal: React, Node.js, UI/UX Design, Figma (pisahkan dengan koma)"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-on-surface">Status (Badge) Profil</label>
            <input
              type="text"
              name="status_badge"
              value={formData.status_badge}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary bg-surface outline-none transition-all"
              placeholder="Misal: 🚀 Open for Collab"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="p-6 space-y-6">
          <h2 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider flex items-center gap-2">
            <FiLink /> Tautan Sosial & Portofolio
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-on-surface flex items-center gap-1.5"><FiGithub /> URL GitHub</label>
              <input
                type="url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary bg-surface outline-none transition-all"
                placeholder="https://github.com/username"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-on-surface flex items-center gap-1.5"><FiLinkedin /> URL LinkedIn</label>
              <input
                type="url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary bg-surface outline-none transition-all"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-on-surface flex items-center gap-1.5"><FiInstagram /> URL Instagram</label>
              <input
                type="url"
                name="instagram_url"
                value={formData.instagram_url}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary bg-surface outline-none transition-all"
                placeholder="https://instagram.com/username"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-on-surface flex items-center gap-1.5"><FiGlobe /> Website Portofolio</label>
              <input
                type="url"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary bg-surface outline-none transition-all"
                placeholder="https://namasaya.com"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="p-6 bg-surface-variant/20 border-t border-outline-variant/20 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[var(--color-primary)] text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FiSave size={18} />
            )}
            Simpan Perubahan
          </motion.button>
        </div>
        
      </form>
    </div>
  );
}
