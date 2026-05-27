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
const manifestPath = path.join(outputDir, "harjumaa-google-places.json");
const searchQuery = process.env.OUTDOOR_GYM_QUERY || "välijõusaal Harjumaa";

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

async function sleep(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function searchOutdoorGymsFromGoogle(query = searchQuery) {
  const results = [];
  let pageToken = "";
  do {
    if (pageToken) await sleep(2200);
    const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
    url.searchParams.set("query", query);
    url.searchParams.set("region", "ee");
    url.searchParams.set("language", "et");
    url.searchParams.set("key", apiKey);
    if (pageToken) url.searchParams.set("pagetoken", pageToken);
    const data = await placesJson(url);
    results.push(...(data.results || []));
    pageToken = data.next_page_token || "";
  } while (pageToken);

  const seen = new Set();
  return results
    .filter(place => {
      const key = place.place_id || place.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(place => ({
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address || place.vicinity || "",
      rating: place.rating || null,
      userRatingsTotal: place.user_ratings_total || 0,
      location: place.geometry?.location || null,
      slug: slug(`${place.name}-${place.formatted_address || place.vicinity || ""}`),
      photoReferences: (place.photos || []).map(photo => photo.photo_reference)
    }));
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
  if (process.argv.includes("--discover-harjumaa")) {
    const places = await searchOutdoorGymsFromGoogle();
    const manifest = {
      query: searchQuery,
      fetchedAt: new Date().toISOString(),
      count: places.length,
      places
    };
    await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`saved ${path.relative(root, manifestPath)} (${places.length} places)`);

    for (const place of places) {
      const photoReference = place.photoReferences[0];
      if (!photoReference) {
        console.warn(`no photo found for ${place.name}`);
        continue;
      }
      const filePath = path.join(outputDir, `${place.slug}.jpg`);
      try {
        await fs.access(filePath);
        console.log(`skip existing ${place.slug}.jpg`);
        continue;
      } catch {}
      await downloadPhoto(photoReference, filePath);
      console.log(`saved ${path.relative(root, filePath)}`);
    }
    return;
  }

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
