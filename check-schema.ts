
import { createAdminClient } from "./src/lib/supabase/admin";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function test() {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient.from("orders").select("*").limit(1);
  console.log("Error:", error);
  if (data && data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
  } else {
    // try inserting a completely empty row to see the error details
    const { error: e2 } = await adminClient.from("orders").insert([{}]).select();
    console.log("Insert error details:", e2);
  }
}
test();
