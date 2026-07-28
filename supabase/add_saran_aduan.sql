-- Buat tabel saran_aduan
CREATE TABLE IF NOT EXISTS public.saran_aduan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT,
  kategori TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.saran_aduan ENABLE ROW LEVEL SECURITY;

-- Allow insert untuk public (siapapun bisa kirim saran)
CREATE POLICY "Enable insert for public" 
ON "public"."saran_aduan" 
FOR INSERT 
WITH CHECK (true);

-- Allow select untuk authenticated users (admin)
CREATE POLICY "Enable select for authenticated users only" 
ON "public"."saran_aduan" 
FOR SELECT 
TO authenticated 
USING (true);

-- Allow delete untuk authenticated users (admin)
CREATE POLICY "Enable delete for authenticated users only" 
ON "public"."saran_aduan" 
FOR DELETE 
TO authenticated 
USING (true);
