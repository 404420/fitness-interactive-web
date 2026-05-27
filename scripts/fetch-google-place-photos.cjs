const fs = require("fs/promises");
const path = require("path");

const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
if (!apiKey) {
  console.error("Missing GOOGLE_MAPS_API_KEY or GOOGLE_PLACES_API_KEY.");
  process.exit(1);
}

const root = path.resolve(__dirname, "..");
const indexPath = path.join(root, "index.html");
const outputDir = path.join(root, "assets", "outdoor-gyms");

function slug(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[õÕ]/g, "o")
    .replace(/[äÄ]/g, "a")
    .replace(/[öÖ]/g, "o")
    .replace(/[üÜ]/g, "u")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

async function placesJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const data = await res.json();
  if (data.status && !["OK", "ZERO_RESULTS"].includes(data.status)) {
    throw new Error(`${data.status}: ${data.error_message || "Google Places request failed"}`);
  }
  return data;
}

async function findPhotoReference(query) {
  const findUrl = new URL("https://maps.googleapis.com/maps/api/place/findplacefromtext/json");
  findUrl.searchParams.set("input", query);
  findUrl.searchParams.set("inputtype", "textquery");
  findUrl.searchParams.set("fields", "place_id,name,photos");
  findUrl.searchParams.set("key", apiKey);
  const found = await placesJson(findUrl);
  const candidate = found.candidates?.[0];
  if (!candidate) return null;
  if (candidate.photos?.[0]?.photo_reference) return candidate.photos[0].photo_reference;

  const detailUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  detailUrl.searchParams.set("place_id", candidate.place_id);
  detailUrl.searchParams.set("fields", "name,photos");
  detailUrl.searchParams.set("key", apiKey);
  const detail = await placesJson(detailUrl);
  return detail.result?.photos?.[0]?.photo_reference || null;
}

async function downloadPhoto(photoReference, filePath) {
  const photoUrl = new URL("https://maps.googleapis.com/maps/api/place/photo");
  photoUrl.searchParams.set("maxwidth", "1400");
  photoUrl.searchParams.set("photo_reference", photoReference);
  photoUrl.searchParams.set("key", apiKey);
  const res = await fetch(photoUrl);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(filePath, buffer);
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const html = await fs.readFile(indexPath, "utf8");
  const start = html.indexOf("const outdoorGyms = [");
  const end = html.indexOf("function outdoorGymLabels", start);
  if (start < 0 || end < 0) throw new Error("Could not locate outdoorGyms block in index.html");
  const block = html.slice(start, end);
  const gymMatches = [...block.matchAll(/name:\s*"([^"]+)"[\s\S]*?address:\s*"([^"]+)"/g)];
  const gyms = gymMatches.map(match => ({ name: match[1], address: match[2], slug: slug(match[1]) }));

  for (const gym of gyms) {
    const filePath = path.join(outputDir, `${gym.slug}.jpg`);
    try {
      await fs.access(filePath);
      console.log(`skip existing ${gym.slug}.jpg`);
      continue;
    } catch {}

    const query = `${gym.name}, ${gym.address}`;
    console.log(`fetch ${query}`);
    const photoReference = await findPhotoReference(query);
    if (!photoReference) {
      console.warn(`no photo found for ${query}`);
      continue;
    }
    await downloadPhoto(photoReference, filePath);
    console.log(`saved ${path.relative(root, filePath)}`);
  }
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
