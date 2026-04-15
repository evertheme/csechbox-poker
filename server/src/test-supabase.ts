import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Always load `server/.env` next to this package (works even if npm is run from repo root).
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

if (!url || !key) {
  console.error(
    "❌ Missing Supabase env vars. Set SUPABASE_URL and SUPABASE_KEY or SUPABASE_SERVICE_KEY in server/.env (see server/.env.example)."
  );
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
    } else {
      console.log("✅ Connection successful!");
      console.log("📊 Users table accessible (sample rows:", data?.length ?? 0, ")");
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("❌ Error:", message);
  }
}

void testConnection();
