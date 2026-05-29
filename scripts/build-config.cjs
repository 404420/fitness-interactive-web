const fs = require("node:fs");
const path = require("node:path");

const url = process.env.SUPABASE_URL || "";
const anonKey = process.env.SUPABASE_ANON_KEY || "";
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");

const out = `window.ELITE_SUPABASE_CONFIG = ${JSON.stringify({ url, anonKey }, null, 2)};\n`;
fs.writeFileSync(path.join(root, "config.js"), out, "utf8");

fs.rmSync(publicDir, { recursive: true, force: true });
fs.mkdirSync(publicDir, { recursive: true });
fs.copyFileSync(path.join(root, "index.html"), path.join(publicDir, "index.html"));
fs.writeFileSync(path.join(publicDir, "config.js"), out, "utf8");

if (!url || !anonKey) {
  console.warn("Supabase config not provided. The app will run with local-only fallback.");
} else {
  console.log("Generated config.js for Supabase browser client.");
}
console.log("Prepared public/ output directory for Vercel.");
