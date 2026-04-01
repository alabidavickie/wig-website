import { createAdminClient } from './src/lib/supabase/admin';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function getItemsCols() {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient.from('orders').select('*').limit(1);
  if (data && data.length > 0) {
    console.log('Columns orders:', Object.keys(data[0]));
  } else {
    // try to trigger a different error or get empty array
    const { data: d2 } = await adminClient.from('orders').select('*').limit(0);
    console.log('Zero rows, try RPC or just insert to see error');
    const { error: e2 } = await adminClient.from('orders').insert([{}]).select();
    console.log('Insert error details:', e2);
  }
}
getItemsCols();
