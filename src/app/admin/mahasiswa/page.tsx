"use client";
// Force Next.js Turbopack cache bust

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiSearch, FiCheckCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { getMahasiswa, deleteMahasiswa } from "./actions";
import { useToast } from "@/components/ui/Toast";

export default function AdminMahasiswaPage() {
  const [mahasiswas, setMahasiswas] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: "", name: "" });
  const toast = useToast();

  const fetchData = async () => {
    setLoading(true);
    const data = await getMahasiswa();
    setMahasiswas(data);
    setFiltered(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!search) {
      setFiltered(mahasiswas);
    } else {
      const lower = search.toLowerCase();
      setFiltered(
        mahasiswas.filter(
          (m) =>
            m.full_name?.toLowerCase().includes(lower) ||
            m.email?.toLowerCase().includes(lower) ||
            m.prodi?.toLowerCase().includes(lower)
        )
      );
    }
  }, [search, mahasiswas]);

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const confirmDelete = async () => {
    const res = await deleteMahasiswa(deleteModal.id);
    if (res.success) {
      toast.success("Profil mahasiswa berhasil dihapus!");
      setDeleteModal({ isOpen: false, id: "", name: "" });
      fetchData();
    } else {
      toast.error("Gagal menghapus: " + res.error);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-on-surface mb-1">Kelola Mahasiswa</h2>
          <p className="text-on-surface-variant text-sm">
            Daftarkan mahasiswa baru untuk memberikan mereka akses dasbor profil portofolio.
          </p>
        </div>
        <Link
          href="/admin/mahasiswa/form"
          className="bg-primary text-white px-4 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <FiPlus size={18} /> Tambah Mahasiswa
        </Link>
      </div>

      <div className="bg-surface border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-outline-variant/30 flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-variant/10">
          <div className="relative w-full sm:max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-outline-variant/40 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="text-sm font-medium text-on-surface-variant">
            Total: {filtered.length} Mahasiswa
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-variant/20 text-on-surface-variant text-sm border-b border-outline-variant/20">
                <th className="py-4 px-6 font-medium whitespace-nowrap">Profil</th>
                <th className="py-4 px-6 font-medium whitespace-nowrap">Email Kampus</th>
                <th className="py-4 px-6 font-medium whitespace-nowrap">Prodi & Angkatan</th>
                <th className="py-4 px-6 font-medium whitespace-nowrap">Status Akun</th>
                <th className="py-4 px-6 font-medium text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-on-surface-variant/70">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-on-surface-variant/70">
                    Tidak ada data mahasiswa ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="border-b border-gray-50 hover:bg-surface-variant/10 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 overflow-hidden">
                          {m.avatar_url ? (
                            <img src={m.avatar_url} alt={m.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <FiUser size={18} />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-on-surface line-clamp-1">{m.full_name}</div>
                          {m.is_featured && (
                            <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold uppercase mt-1 inline-block">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-on-surface-variant">
                      {m.email}
                    </td>
                    <td className="py-4 px-6 text-sm text-on-surface-variant">
                      <div className="font-medium text-on-surface">{m.prodi}</div>
                      <div className="text-xs mt-0.5">Angkatan {m.angkatan}</div>
                    </td>
                    <td className="py-4 px-6">
                      {m.user_id ? (
                        <span className="flex items-center gap-1.5 w-fit bg-green-50 text-green-600 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                          <FiCheckCircle size={14} /> Terklaim
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 w-fit bg-surface-variant/30 text-on-surface-variant px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                          Menunggu
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/mahasiswa/form?id=${m.id}`}
                          className="p-2 bg-surface-variant/30 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Edit Mahasiswa"
                        >
                          <FiEdit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(m.id, m.full_name)}
                          className="p-2 bg-surface-variant/30 text-on-surface-variant hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Mahasiswa"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setDeleteModal({ isOpen: false, id: "", name: "" })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-surface rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-outline-variant/20"
            >
              <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
                <FiTrash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-center text-on-surface mb-2">Hapus Profil?</h3>
              <p className="text-center text-on-surface-variant text-sm mb-8">
                Apakah Anda yakin ingin menghapus profil mahasiswa <strong className="text-on-surface">{deleteModal.name}</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, id: "", name: "" })}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-on-surface-variant bg-surface-variant/30 hover:bg-surface-variant/50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 transition-all hover:-translate-y-0.5"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
