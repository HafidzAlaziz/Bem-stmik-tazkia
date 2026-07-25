"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MahasiswaHero from "@/components/mahasiswa/MahasiswaHero";
import MahasiswaCard, { MahasiswaProfile } from "@/components/mahasiswa/MahasiswaCard";
import MahasiswaProfileDrawer from "@/components/mahasiswa/MahasiswaProfileDrawer";
import { ProjectData } from "@/components/mahasiswa/ProjectCard";
import { createClient } from "@/utils/supabase/client";
import Footer from "@/components/layout/Footer";
import { FiUserX, FiUsers, FiFolder } from "react-icons/fi";

export default function MahasiswaShowcasePage() {
  const [mahasiswaList, setMahasiswaList] = useState<MahasiswaProfile[]>([]);
  const [projectList, setProjectList] = useState<(ProjectData & { mahasiswa_id: string })[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAngkatan, setSelectedAngkatan] = useState<number | null>(null);
  const [selectedProdi, setSelectedProdi] = useState("Semua Prodi");
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<MahasiswaProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  // Fetch Data from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const { data: profiles, error: profileErr } = await supabase
          .from("mahasiswa_profiles")
          .select("*")
          .order("angkatan", { ascending: false });

        const { data: projects, error: projErr } = await supabase
          .from("mahasiswa_projects")
          .select("*");

        if (profiles && profiles.length > 0) {
          // Count projects per mahasiswa
          const formattedProfiles = profiles.map((p) => {
            const count = projects?.filter((proj) => proj.mahasiswa_id === p.id).length || 0;
            return { ...p, projects_count: count };
          });
          setMahasiswaList(formattedProfiles);
        }

        if (projects && projects.length > 0) {
          setProjectList(projects);
        }
      } catch (err) {
        console.error("Error fetching mahasiswa data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [supabase]);

  // Extract available Angkatan dynamically
  const availableAngkatan = useMemo(() => {
    const years = Array.from(new Set(mahasiswaList.map((m) => m.angkatan))).sort((a, b) => b - a);
    return years.length > 0 ? years : [2021, 2022, 2023, 2024, 2025];
  }, [mahasiswaList]);

  // Filter logic
  const filteredMahasiswa = useMemo(() => {
    return mahasiswaList.filter((m) => {
      // Filter by Angkatan
      if (selectedAngkatan !== null && m.angkatan !== selectedAngkatan) {
        return false;
      }
      // Filter by Prodi
      if (selectedProdi !== "Semua Prodi" && m.prodi !== selectedProdi) {
        return false;
      }
      // Filter by Search Query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesName = m.full_name.toLowerCase().includes(query);
        const matchesNIM = m.nim?.toLowerCase().includes(query) || false;
        const matchesBio = m.bio?.toLowerCase().includes(query) || false;
        const matchesSkills = m.skills?.some((s) => s.toLowerCase().includes(query));

        // Check if any project title/tech stack matches
        const studentProjects = projectList.filter((p) => p.mahasiswa_id === m.id);
        const matchesProject = studentProjects.some(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            p.tech_stack?.some((t) => t.toLowerCase().includes(query))
        );

        return matchesName || matchesNIM || matchesBio || matchesSkills || matchesProject;
      }

      return true;
    });
  }, [mahasiswaList, projectList, searchQuery, selectedAngkatan, selectedProdi]);

  // Active student's projects for drawer modal
  const selectedStudentProjects = useMemo(() => {
    if (!selectedMahasiswa) return [];
    return projectList.filter((p) => p.mahasiswa_id === selectedMahasiswa.id);
  }, [selectedMahasiswa, projectList]);

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      {/* Hero Section with Search & Filters */}
      <MahasiswaHero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedAngkatan={selectedAngkatan}
        setSelectedAngkatan={setSelectedAngkatan}
        selectedProdi={selectedProdi}
        setSelectedProdi={setSelectedProdi}
        totalMahasiswa={mahasiswaList.length}
        totalProjects={projectList.length}
        availableAngkatan={availableAngkatan}
      />

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-5 md:px-10 py-12 flex-1 w-full">
        {/* Section Title Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface flex items-center gap-2">
              <FiUsers className="text-primary" />
              {selectedAngkatan ? `Mahasiswa Angkatan ${selectedAngkatan}` : "Seluruh Mahasiswa"}
            </h2>
            <p className="text-on-surface-variant text-sm mt-1">
              {filteredMahasiswa.length} mahasiswa ditemukan
              {selectedProdi !== "Semua Prodi" ? ` (${selectedProdi})` : ""}
            </p>
          </div>
        </div>

        {/* Mahasiswa Grid */}
        {filteredMahasiswa.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {filteredMahasiswa.map((mahasiswa) => (
                <MahasiswaCard
                  key={mahasiswa.id}
                  mahasiswa={mahasiswa}
                  onSelect={(m) => setSelectedMahasiswa(m)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 px-6 rounded-3xl bg-surface-container/50 border border-outline-variant/30 max-w-lg mx-auto"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <FiUserX size={32} />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">Mahasiswa Tidak Ditemukan</h3>
            <p className="text-on-surface-variant text-sm mb-6">
              Tidak ada data mahasiswa yang cocok dengan pencarian kata kunci atau filter angkatan kamu.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedAngkatan(null);
                setSelectedProdi("Semua Prodi");
              }}
              className="px-6 py-2.5 rounded-full bg-secondary text-white text-xs font-bold hover:bg-secondary/90 transition-all shadow-md"
            >
              Reset Filter Pencarian
            </button>
          </motion.div>
        )}
      </main>

      {/* Student Profile Drawer / Modal Showcase */}
      <MahasiswaProfileDrawer
        mahasiswa={selectedMahasiswa}
        projects={selectedStudentProjects}
        onClose={() => setSelectedMahasiswa(null)}
      />

    </div>
  );
}
