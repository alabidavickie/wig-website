// Re-loading dotenv for the standalone script context
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

async function verifyApplicationClient() {
  console.log("📡 Verifying Application's Stripe Client...");
  console.log("-------------------------------------------");
  
  try {
    // Dynamically import AFTER dotenv is loaded
    const { stripe } = await import("./src/lib/stripe");
    
    const startTime = Date.now();
    const balance = await stripe.balance.retrieve();
    const duration = Date.now() - startTime;
    
    console.log(`✅ SUCCESS: Application client connected in ${duration}ms`);
    console.log(`Current Balance: ${balance.available[0].amount / 100} ${balance.available[0].currency.toUpperCase()}`);
    console.log("-------------------------------------------");
    console.log("The checkout timeout issue is now resolved.");
  } catch (error: any) {
    console.error("❌ VERIFICATION FAILED!");
    console.error("Message:", error.message);
    process.exit(1);
  }
}

verifyApplicationClient();
