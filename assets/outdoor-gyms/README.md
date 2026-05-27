# Outdoor Gym Photos

Place-specific outdoor gym photos belong here.

The app looks for files by slug, for example:

- `astangu-tn-74-joulinnak.jpg`
- `pirita-rannaala-joulinnak.jpg`
- `pae-pargi-joulinnak.jpg`

Use `npm run fetch:outdoor-photos` with a Google Places API key to download official Google Places photos into this folder. Do not add random stock photos for location cards.

Use `npm run fetch:harjumaa-outdoor-gyms` to query Google Places for `välijõusaal Harjumaa`, save `harjumaa-google-places.json`, and download the first Google Places photo for each discovered outdoor gym.

Required environment variable:

```powershell
$env:GOOGLE_MAPS_API_KEY="your-key"
npm run fetch:harjumaa-outdoor-gyms
```
