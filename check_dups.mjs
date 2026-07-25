import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('mahasiswa_profiles')
    .delete()
    .eq('id', '8c370217-6566-426c-918d-26a46647c622');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log("Mock data deleted successfully.");
}

run();
