-- ========================================================
-- Migration: Create Mahasiswa & Project Showcase System
-- Description: Tables for Student Profiles per Angkatan and their Project Repositories
-- ========================================================

-- 1. Create Mahasiswa Profiles Table
CREATE TABLE IF NOT EXISTS public.mahasiswa_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nim VARCHAR(20),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  angkatan INTEGER NOT NULL, -- e.g. 2021, 2022, 2023, 2024, 2025
  prodi TEXT NOT NULL DEFAULT 'Teknik Informatika', -- 'Teknik Informatika', 'Sistem Informasi', 'Bisnis Digital'
  avatar_url TEXT,
  cover_url TEXT,
  bio TEXT,
  status_badge TEXT DEFAULT '🚀 Open for Collab',
  github_url TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  website_url TEXT,
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Mahasiswa Projects Table (Showcase / Repositories)
CREATE TABLE IF NOT EXISTS public.mahasiswa_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mahasiswa_id UUID NOT NULL REFERENCES public.mahasiswa_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  tech_stack TEXT[] DEFAULT ARRAY[]::TEXT[],
  demo_url TEXT,
  github_url TEXT,
  cover_image TEXT,
  likes_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Project Likes Tracking Table
CREATE TABLE IF NOT EXISTS public.mahasiswa_project_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.mahasiswa_projects(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL, -- user_id or IP hash
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_identifier)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mahasiswa_angkatan ON public.mahasiswa_profiles(angkatan);
CREATE INDEX IF NOT EXISTS idx_mahasiswa_prodi ON public.mahasiswa_profiles(prodi);
CREATE INDEX IF NOT EXISTS idx_projects_mahasiswa_id ON public.mahasiswa_projects(mahasiswa_id);

-- Enable RLS
ALTER TABLE public.mahasiswa_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mahasiswa_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mahasiswa_project_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public Read Access
CREATE POLICY "Public Read Mahasiswa Profiles" ON public.mahasiswa_profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Mahasiswa Projects" ON public.mahasiswa_projects FOR SELECT USING (true);
CREATE POLICY "Public Read Project Likes" ON public.mahasiswa_project_likes FOR SELECT USING (true);

-- Authenticated Full Access / Admin Access
CREATE POLICY "Enable All for Authenticated users" ON public.mahasiswa_profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable All for Authenticated users on Projects" ON public.mahasiswa_projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public Insert Project Likes" ON public.mahasiswa_project_likes FOR INSERT WITH CHECK (true);

-- ========================================================
-- SEED DATA FOR TESTING (Contoh Data Mahasiswa & Proyek)
-- ========================================================

INSERT INTO public.mahasiswa_profiles (id, nim, full_name, email, angkatan, prodi, avatar_url, bio, status_badge, github_url, linkedin_url, skills, is_featured)
VALUES 
  (
    'a1111111-1111-1111-1111-111111111111',
    '2021001',
    'Fathan Abdillah',
    'fathan.dev@stmik-tazkia.ac.id',
    2022,
    'Teknik Informatika',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'Fullstack Web Developer & Open Source Enthusiast. Suka membangun aplikasi skala besar dengan Next.js dan Supabase.',
    '🚀 Open for Collab',
    'https://github.com',
    'https://linkedin.com',
    ARRAY['Next.js', 'TypeScript', 'TailwindCSS', 'Supabase', 'Node.js'],
    TRUE
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    '2022015',
    'Siti Aisha Rahma',
    'aisha.ui@stmik-tazkia.ac.id',
    2023,
    'Sistem Informasi',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    'UI/UX Designer & Frontend Developer. Berfokus pada Micro-interactions, Glassmorphism, dan Design Systems.',
    '🎨 UI/UX Designer',
    'https://github.com',
    'https://linkedin.com',
    ARRAY['Figma', 'React', 'TailwindCSS', 'Framer Motion', 'UI/UX'],
    TRUE
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    '2023042',
    'Muhammad Rizky',
    'rizky.ai@stmik-tazkia.ac.id',
    2023,
    'Teknik Informatika',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'AI Researcher & Python Engineer. Meneliti LLM, Computer Vision, dan Data Analytics di STMIK Tazkia.',
    '🤖 AI & ML Engineer',
    'https://github.com',
    'https://linkedin.com',
    ARRAY['Python', 'PyTorch', 'FastAPI', 'OpenCV', 'TensorFlow'],
    FALSE
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    '2024008',
    'Nabilah Putri',
    'nabilah.biz@stmik-tazkia.ac.id',
    2024,
    'Bisnis Digital',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    'Digital Marketer & Product Analyst. Menggabungkan teknologi web dengan strategi pertumbuhan bisnis startup.',
    '📈 Growth & Product',
    'https://github.com',
    'https://linkedin.com',
    ARRAY['Product Management', 'SEO', 'Data Analytics', 'Figma', 'HTML/CSS'],
    FALSE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.mahasiswa_projects (id, mahasiswa_id, title, description, tech_stack, demo_url, github_url, cover_image, likes_count, is_featured)
VALUES
  (
    'b1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'Tazkia Smart Academic Portal',
    'Portal akademik mahasiswa modern dengan sistem rekomendasi mata kuliah cerdas berbasis AI dan antarmuka real-time.',
    ARRAY['Next.js', 'TypeScript', 'Supabase', 'TailwindCSS'],
    'https://example.com',
    'https://github.com',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    24,
    TRUE
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    'a1111111-1111-1111-1111-111111111111',
    'E-Commerce Syariah Mobile App',
    'Aplikasi mobile belanja syariah berbasis Flutter dengan enkripsi transaksi end-to-end dan dompet digital.',
    ARRAY['Flutter', 'Dart', 'Firebase', 'REST API'],
    'https://example.com',
    'https://github.com',
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
    18,
    FALSE
  ),
  (
    'b3333333-3333-3333-3333-333333333333',
    'a2222222-2222-2222-2222-222222222222',
    'Design System STMIK Tazkia v2.0',
    'Sistem desain antarmuka komprehensif untuk seluruh aplikasi web & mobile di lingkungan kampus STMIK Tazkia.',
    ARRAY['Figma', 'TailwindCSS', 'Storybook', 'Framer Motion'],
    'https://example.com',
    'https://github.com',
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    35,
    TRUE
  ),
  (
    'b4444444-4444-4444-4444-444444444444',
    'a3333333-3333-3333-3333-333333333333',
    'Tazkia Campus AI Assistant',
    'Chatbot kecerdasan buatan berbasis RAG (Retrieval-Augmented Generation) untuk menjawab pertanyaan seputar kampus & tugas.',
    ARRAY['Python', 'FastAPI', 'LangChain', 'OpenAI'],
    'https://example.com',
    'https://github.com',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    42,
    TRUE
  )
ON CONFLICT (id) DO NOTHING;
