const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkKarya() {
  const { data: karya, error } = await supabase
    .from('karya')
    .select('id, title, status, reject_reason, user_id, updated_at')
    .order('updated_at', { ascending: false })
    .limit(5);

  if (error) console.error(error);
  else console.log(JSON.stringify(karya, null, 2));
}

checkKarya();
