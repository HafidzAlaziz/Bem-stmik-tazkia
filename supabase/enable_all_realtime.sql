BEGIN;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS mahasiswa_profiles;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS berita;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS kabinet;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS profiles;

ALTER PUBLICATION supabase_realtime ADD TABLE mahasiswa_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE berita;
ALTER PUBLICATION supabase_realtime ADD TABLE kabinet;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
COMMIT;
