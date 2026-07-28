"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiAlertCircle, FiCheckCircle, FiClock, FiFileText, FiEdit2, FiTrash2, FiX, FiUsers, FiHeart } from "react-icons/fi";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardKaryaList({ initialKaryaList }: { initialKaryaList: any[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [karyaList, setKaryaList] = useState(initialKaryaList);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectModalData, setRejectModalData] = useState<{
    id: string;
    title: string;
    message: string;
    type: 'upload' | 'edit' | 'deletion';
  } | null>(null);

  const [confirmDeleteData, setConfirmDeleteData] = useState<any | null>(null);

  const handleDelete = async (karya: any) => {
    if (karya.status === "pending" || karya.status === "rejected") {
      // Direct deletion without approval, open confirm modal first
      setConfirmDeleteData(karya);
    } else if (karya.status === "approved") {
      // Open deletion request modal
      setDeletingId(karya.id);
      setDeleteReason("");
    }
  };

  const confirmDirectDelete = async () => {
    if (!confirmDeleteData) return;
    setIsSubmitting(true);
    const { error } = await supabase.from('karya').delete().eq('id', confirmDeleteData.id);
    if (!error) {
      setKaryaList(prev => prev.filter(k => k.id !== confirmDeleteData.id));
      router.refresh();
      setConfirmDeleteData(null);
    } else {
      alert("Gagal menghapus karya.");
    }
    setIsSubmitting(false);
  };

  const hideDeletedKarya = async (id: string) => {
    setIsSubmitting(true);
    const { error } = await supabase.from('karya').delete().eq('id', id);
    if (!error) {
      setKaryaList(prev => prev.filter(k => k.id !== id));
      router.refresh();
    }
    setIsSubmitting(false);
  };

  const submitDeleteRequest = async () => {
    if (!deletingId || !deleteReason.trim()) return;
    setIsSubmitting(true);

    const { error } = await supabase.from('karya').update({
      status: 'deletion_pending',
      deletion_reason: deleteReason,
      deletion_reject_reason: null
    }).eq('id', deletingId);

    if (!error) {
      setKaryaList(prev => prev.map(k => k.id === deletingId ? { ...k, status: 'deletion_pending', deletion_reason: deleteReason, deletion_reject_reason: null } : k));
      setDeletingId(null);
      router.refresh();
    } else {
      alert("Gagal mengirim permintaan hapus.");
    }
    setIsSubmitting(false);
  };

  const dismissRejectReason = async (karyaId: string) => {
    const { error } = await supabase.from('karya').update({
      deletion_reject_reason: null
    }).eq('id', karyaId);

    setKaryaList(prev => prev.map(k => k.id === karyaId ? { ...k, deletion_reject_reason: null } : k));
    await supabase.from('karya').update({ deletion_reject_reason: null }).eq('id', karyaId);
  };

  const cancelPendingEdit = async (karyaId: string) => {
    setKaryaList(prev => prev.map(k => k.id === karyaId ? { ...k, edit_reject_reason: null, pending_edits: null } : k));
    await supabase.from('karya').update({ edit_reject_reason: null, pending_edits: null }).eq('id', karyaId);
  };

  if (!karyaList || karyaList.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 bg-surface-variant/20 rounded-2xl border border-dashed border-outline-variant/50 relative overflow-hidden"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-6 relative"
        >
          <div className="absolute inset-0 bg-[var(--color-primary)]/20 rounded-full animate-ping opacity-50" />
          <FiFileText size={32} className="text-[var(--color-primary)] relative z-10" />
        </motion.div>

        <h3 className="text-xl font-bold text-on-surface mb-3">Belum Ada Karya</h3>
        <p className="text-on-surface-variant mb-8 max-w-sm mx-auto text-sm leading-relaxed">
          Ruang pameranmu masih kosong nih. Yuk, bagikan inovasimu sekarang dan jadilah inspirasi!
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/dashboard/upload"
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all hover:bg-primary/90"
          >
            Upload Karya Pertamamu
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {karyaList.map((karya) => (
          <motion.div
            key={karya.id}
            whileHover={{ y: -4, scale: 1.005 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex flex-col md:flex-row md:items-start justify-between p-5 rounded-2xl border border-outline-variant/30 bg-surface shadow-sm hover:shadow-md hover:border-outline-variant/60 transition-colors gap-4"
          >

            {/* Thumbnail */}
            <div className="shrink-0">
              {karya.image_url ? (
                <img
                  src={karya.image_url}
                  alt={karya.title}
                  className="w-24 h-20 md:w-28 md:h-22 object-cover rounded-xl border border-outline-variant/20"
                />
              ) : (
                <div className="w-24 h-20 md:w-28 rounded-xl bg-surface-variant/40 border border-outline-variant/20 flex items-center justify-center text-on-surface-variant/40">
                  <FiFileText size={28} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h3 className="font-bold text-lg text-on-surface truncate">{karya.title}</h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-surface-variant text-on-surface-variant uppercase tracking-wider shrink-0">
                  {karya.category}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant line-clamp-1 mb-2">
                {karya.description}
              </p>
              <div className="flex items-center gap-4 text-xs font-medium flex-wrap">
                <span className="text-on-surface-variant/70">
                  Diunggah pada {new Date(karya.created_at).toLocaleDateString('id-ID')}
                </span>
                {karya.status === 'approved' && (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-on-surface bg-surface-variant/30 px-2.5 py-1 rounded-md">
                      <FiUsers size={12} className="text-[var(--color-primary)]" />
                      {karya.views || 0} Kali Dilihat
                    </span>
                    <span className="flex items-center gap-1.5 text-on-surface bg-surface-variant/30 px-2.5 py-1 rounded-md">
                      <FiHeart size={12} className="text-red-500" />
                      {karya.likes || 0} Disukai
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 flex flex-wrap md:flex-col md:items-end gap-2 mt-2 md:mt-0">
              {/* Status Badges */}
              {karya.status === 'pending' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 font-semibold text-sm border border-amber-100 w-fit">
                  <FiClock size={16} /> Menunggu Review
                </div>
              )}
              {karya.status === 'approved' && (
                <div className="flex flex-col gap-2 w-fit">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 font-semibold text-sm border border-green-100">
                    <FiCheckCircle size={16} /> Disetujui (Publik)
                  </div>
                  {karya.pending_edits && !karya.edit_reject_reason && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 font-semibold text-sm border border-amber-100 w-fit">
                      <FiClock size={16} /> Edit Menunggu Review
                    </div>
                  )}
                  {karya.edit_reject_reason && (
                    <button
                      onClick={() => setRejectModalData({ id: karya.id, title: "Usulan Edit Ditolak", message: karya.edit_reject_reason, type: 'edit' })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm border border-red-100 w-fit transition-colors"
                    >
                      <FiAlertCircle size={16} /> Edit Ditolak (Lihat Pesan)
                    </button>
                  )}
                  {karya.deletion_reject_reason && (
                    <button
                      onClick={() => setRejectModalData({ id: karya.id, title: "Permintaan Hapus Ditolak", message: karya.deletion_reject_reason, type: 'deletion' })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold text-sm border border-orange-100 w-fit transition-colors"
                    >
                      <FiAlertCircle size={16} /> Hapus Ditolak (Lihat Pesan)
                    </button>
                  )}
                </div>
              )}
              {karya.status === 'rejected' && (
                <div className="flex flex-col gap-2 w-fit">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-semibold text-sm border border-red-100 w-fit">
                    <FiAlertCircle size={16} /> Pengajuan Ditolak
                  </div>
                  {karya.reject_reason && (
                    <button
                      onClick={() => setRejectModalData({ id: karya.id, title: "Karya Ditolak", message: karya.reject_reason, type: 'upload' })}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm border border-red-100 w-full transition-colors"
                    >
                      Lihat Catatan Admin
                    </button>
                  )}
                </div>
              )}
              {karya.status === 'deletion_pending' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 font-semibold text-sm border border-purple-100 w-fit">
                  <FiClock size={16} /> Menunggu Hapus
                </div>
              )}
              {karya.status === 'deleted' && (
                <div className="flex flex-col gap-2 w-fit">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 font-semibold text-sm border border-gray-300 w-fit shadow-sm">
                    <FiTrash2 size={16} /> Telah Dihapus Admin
                  </div>
                </div>
              )}

              <div className="flex gap-2 w-full md:w-auto mt-3 md:mt-0">
                {karya.status !== 'deletion_pending' && karya.status !== 'deleted' && (
                  <div className="relative flex-1 md:flex-none">
                    <Link
                      href={`/dashboard/edit/${karya.id}`}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-variant/50 text-on-surface-variant font-semibold text-sm border border-outline-variant/30 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-colors"
                    >
                      <FiEdit2 size={14} /> Edit
                    </Link>
                    {karya.status === 'rejected' && (
                      <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4 w-[220px] text-center z-10 pointer-events-none hidden md:block animate-pulse">
                        <div className="bg-[var(--color-primary)] text-white text-xs leading-relaxed font-bold py-2.5 px-4 rounded-xl shadow-lg relative">
                          Jangan menyerah! Yuk perbaiki dan ajukan ulang karyamu 💪
                          <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-[var(--color-primary)] rotate-45 rounded-sm"></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {karya.status === 'deleted' ? (
                  <button
                    onClick={() => hideDeletedKarya(karya.id)}
                    disabled={isSubmitting}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-variant/50 text-on-surface-variant font-semibold text-sm border border-outline-variant/30 hover:bg-gray-700 hover:text-white hover:border-gray-700 transition-colors w-fit disabled:opacity-50"
                  >
                    <FiX size={14} /> Tutup & Hilangkan
                  </button>
                ) : (
                  <button
                    onClick={() => handleDelete(karya)}
                    disabled={karya.status === 'deletion_pending'}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-variant/50 text-on-surface-variant font-semibold text-sm border border-outline-variant/30 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors w-fit disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiTrash2 size={14} /> Hapus
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Rejection Modal */}
      <AnimatePresence>
        {rejectModalData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-outline-variant/30 flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
                <FiAlertCircle size={24} />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">{rejectModalData.title}</h3>
              <p className="text-on-surface-variant text-sm mb-6 bg-surface-variant/30 p-3 rounded-xl border border-outline-variant/30 w-full text-left">
                {rejectModalData.message}
              </p>

              <div className="flex gap-3 w-full">
                {rejectModalData.type === 'edit' && (
                  <>
                    <button
                      onClick={() => setRejectModalData(null)}
                      className="flex-1 py-2.5 px-4 rounded-xl font-bold text-on-surface-variant bg-surface-variant hover:bg-outline-variant/30 transition-colors shadow-sm"
                    >
                      Tutup
                    </button>
                    <button
                      onClick={() => {
                        cancelPendingEdit(rejectModalData.id);
                        setRejectModalData(null);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm"
                    >
                      Batalkan & Hapus Draft
                    </button>
                  </>
                )}
                {rejectModalData.type === 'deletion' && (
                  <button
                    onClick={() => {
                      dismissRejectReason(rejectModalData.id);
                      setRejectModalData(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl font-bold text-white bg-[var(--color-primary)] hover:opacity-90 transition-colors shadow-sm"
                  >
                    Tutup & Mengerti
                  </button>
                )}
                {rejectModalData.type === 'upload' && (
                  <button
                    onClick={() => setRejectModalData(null)}
                    className="flex-1 py-2.5 px-4 rounded-xl font-bold text-white bg-[var(--color-primary)] hover:opacity-90 transition-colors shadow-sm"
                  >
                    Tutup
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deletion Request Modal */}
      <AnimatePresence>
        {deletingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-surface rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-outline-variant/30"
            >
              <div className="p-6 border-b border-outline-variant/20">
                <h3 className="text-xl font-bold text-on-surface">Ajukan Penghapusan</h3>
                <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                  Karya yang sudah dipublikasi memerlukan persetujuan BEM untuk dihapus.
                  Mohon sertakan alasan yang jelas.
                </p>
              </div>
              <div className="p-6">
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Contoh: Terdapat bug kritikal pada aplikasi, atau ingin mengganti dengan versi baru..."
                  className="w-full min-h-[120px] p-4 bg-surface-variant/20 border border-outline-variant/40 rounded-xl focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 resize-none text-sm transition-all"
                  disabled={isSubmitting}
                />
              </div>
              <div className="px-6 py-4 bg-surface-variant/10 border-t border-outline-variant/20 flex gap-3 justify-end">
                <button
                  onClick={() => { setDeletingId(null); setDeleteReason(""); }}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-variant/50 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={submitDeleteRequest}
                  disabled={!deleteReason.trim() || isSubmitting}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-red-500/20"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : 'Ajukan Hapus'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Direct Delete Modal */}
      <AnimatePresence>
        {confirmDeleteData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-surface rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-outline-variant/30 p-6 flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
                <FiTrash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">Hapus Karya?</h3>
              <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                Apakah Anda yakin ingin menghapus karya <strong>{confirmDeleteData.title}</strong> secara permanen? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setConfirmDeleteData(null)}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 text-sm font-medium text-on-surface-variant bg-surface-variant/30 hover:bg-surface-variant/50 border border-outline-variant/30 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDirectDelete}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Ya, Hapus'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
