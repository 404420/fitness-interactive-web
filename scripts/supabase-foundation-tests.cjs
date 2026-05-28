const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const migration = fs.readFileSync(path.join(root, "supabase", "migrations", "20260528162000_auth_database_foundation.sql"), "utf8");
const envExample = fs.readFileSync(path.join(root, ".env.example"), "utf8");
const gitignore = fs.readFileSync(path.join(root, ".gitignore"), "utf8");

assert.match(html, /window\.ELITE_SUPABASE_CONFIG/);
assert.match(html, /signInWithPassword/);
assert.match(html, /signUp/);
assert.match(html, /profiles"\)\.upsert|profiles"\)\.select/);
assert.match(html, /workout_logs"\)\.upsert/);
assert.match(html, /progress_entries"\)\.upsert/);
assert.match(html, /nutrition_entries"\)\.upsert/);
assert.doesNotMatch(html, /service[_-]?role/i);

for (const table of ["profiles", "workouts", "workout_logs", "goals", "progress_entries", "nutrition_entries"]) {
  assert.match(migration, new RegExp(`create table if not exists public\\.${table}`));
  assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`));
}

assert.match(migration, /auth\.uid\(\) = user_id/);
assert.match(migration, /auth\.uid\(\) = id/);
assert.match(migration, /created_at timestamptz not null default now\(\)/);
assert.match(migration, /updated_at timestamptz not null default now\(\)/);

assert.match(envExample, /SUPABASE_URL=/);
assert.match(envExample, /SUPABASE_ANON_KEY=/);
assert.match(gitignore, /^\.env$/m);
assert.match(gitignore, /^config\.js$/m);

console.log("supabase foundation tests passed");
