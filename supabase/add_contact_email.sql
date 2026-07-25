-- Tambah kolom contact_email ke tabel mahasiswa_profiles
-- Ini adalah email yang bisa diisi sendiri oleh mahasiswa (bebas, disarankan email pribadi)
-- Berbeda dari kolom 'email' yang diisi otomatis dari akun Google kampus

ALTER TABLE mahasiswa_profiles 
ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Juga select contact_email di query
COMMENT ON COLUMN mahasiswa_profiles.contact_email IS 'Email kontak yang diisi mahasiswa sendiri (bisa email pribadi). Digunakan untuk tombol kolaborasi di profil publik.';
