const fs = require("node:fs");
const path = require("node:path");

const url = process.env.SUPABASE_URL || "";
const anonKey = process.env.SUPABASE_ANON_KEY || "";

const out = `window.ELITE_SUPABASE_CONFIG = ${JSON.stringify({ url, anonKey }, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, "..", "config.js"), out, "utf8");

if (!url || !anonKey) {
  console.warn("Supabase config not provided. The app will run with local-only fallback.");
} else {
  console.log("Generated config.js for Supabase browser client.");
}
