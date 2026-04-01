
import { createAdminClient } from "./src/lib/supabase/admin";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function test() {
  try {
    const adminClient = createAdminClient();
    console.log("Creating test order...");
    const { data: order, error } = await adminClient.from("orders").insert([{
      email: "test@example.com",
      shipping_info: { firstName: "Test", lastName: "User", address: "123 Main", city: "London", zip: "00000", shippingFee: 20 },
      total_amount: 100,
      currency: "GBP",
      payment_provider: "stripe",
      payment_reference: "cs_test_tester123",
      status: "pending",
      is_guest: false
    }]).select().single();
    
    if (error) {
      console.error("Order Insert Error:", error);
      return;
    }
    console.log("Order created:", order.id);

    const { error: itemsError } = await adminClient.from("order_items").insert([{
      order_id: order.id,
      product_id: "test-product-id",
      product_name: "Test Wig",
      quantity: 1,
      unit_price: 100,
      image_url: "https://example.com/test.jpg",
      attributes: { color: "black" }
    }]);

    if (itemsError) {
      console.error("Order Items Insert Error:", itemsError);
    } else {
      console.log("Order item created successfully!");
    }
  } catch (err) {
    console.error("Caught exception:", err);
  }
}
test();
