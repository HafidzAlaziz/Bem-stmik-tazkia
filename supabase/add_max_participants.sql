-- 1. Tambahkan kolom max_participants ke tabel agendas
ALTER TABLE agendas
ADD COLUMN IF NOT EXISTS max_participants INT DEFAULT NULL;

-- (Penting) Kolom ini akan bernilai NULL secara default, yang berarti "Tidak Ada Batas Kuota".
-- Jika nilainya diisi (misal: 50), maka kuota pendaftar adalah 50.
