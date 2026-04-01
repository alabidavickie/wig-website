import { createAdminClient } from './src/lib/supabase/admin';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function getItemsCols() {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient.from('order_items').select('*').limit(1);
  if (data && data.length > 0) {
    console.log('Columns order_items:', Object.keys(data[0]));
  } else {
    const { error: e2 } = await adminClient.from('order_items').insert([{}]).select();
    console.log('Insert error details:', e2);
  }
}
getItemsCols();
