import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;
if (!url || !key) {
    console.error("❌ Missing SUPABASE_URL or SUPABASE_KEY in environment.");
    process.exit(1);
}
const supabaseUrl = url;
const supabaseKey = key;
const supabase = createClient(supabaseUrl, supabaseKey);
async function testConnection() {
    console.log("🔍 Testing Supabase connection...");
    console.log("URL:", supabaseUrl);
    console.log("Key:", `${supabaseKey.substring(0, 20)}...`);
    try {
        const { data, error } = await supabase.from("users").select("id").limit(1);
        if (error) {
            console.error("❌ Connection failed:", error.message);
        }
        else {
            console.log("✅ Connection successful!");
            console.log("📊 Users table accessible (sample rows:", data?.length ?? 0, ")");
        }
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("❌ Error:", message);
    }
}
void testConnection();
//# sourceMappingURL=test-supabase.js.map