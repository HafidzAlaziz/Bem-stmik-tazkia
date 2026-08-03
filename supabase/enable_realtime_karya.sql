-- Enable realtime for the karya table
BEGIN;
-- Remove the table from the publication if it exists to avoid duplicates
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS karya;
-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE karya;
COMMIT;
