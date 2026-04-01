import { createAdminClient } from './src/lib/supabase/admin';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function getCols() {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient.rpc('get_table_columns_by_name', { t_name: 'orders' });
  console.log(data, error);
}
getCols();
