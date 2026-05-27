# HealthKit Setup And Architecture

## Current State

This repository is still previewable as a web app through GitHub. A browser cannot request Apple Health / HealthKit permissions directly, so the current implementation uses a browser-safe HealthKit bridge contract plus mock/manual fallback data.

The product direction is iOS-first. The app is expected to run inside an iOS shell or native app that can access Apple HealthKit and Apple Watch-derived health data.

## Architecture Decision

The app separates health features into four layers:

1. Native HealthKit provider
   - Runs in iOS.
   - Requests permissions.
   - Reads sleep, sleep stages, resting heart rate, HRV, steps, and workout history.

2. Bridge contract
   - Sends normalized health payloads into the app.
   - The web preview exposes fallback behavior when the native bridge is unavailable.

3. Normalized app model
   - Stores one daily health summary per date.
   - Keeps source, permission status, and sync freshness.

4. Recommendation logic
   - Uses normalized daily health data.
   - Calculates recovery/readiness.
   - Generates deterministic workout recommendations.

## Native Data Needed

HealthKit permissions should request read access for:

- Sleep analysis
- Heart rate
- Resting heart rate
- Heart rate variability SDNN
- Step count
- Active energy burned
- Workouts

Sleep stages should be mapped into:

- `awakeMinutes`
- `remMinutes`
- `coreMinutes`
- `deepMinutes`

## Bridge Contract

The iOS layer should call:

```js
window.receiveHealthKitData(payload)
```

Expected payload:

```json
{
  "date": "2026-05-27",
  "source": "healthKit",
  "permissionStatus": "authorized",
  "sleep": {
    "totalMinutes": 455,
    "qualityScore": 82,
    "stages": {
      "awakeMinutes": 28,
      "remMinutes": 92,
      "coreMinutes": 245,
      "deepMinutes": 90
    }
  },
  "vitals": {
    "restingHeartRate": 56,
    "hrv": 62
  },
  "activity": {
    "steps": 8400,
    "activeEnergyKcal": 520
  },
  "workouts": [
    {
      "type": "Traditional Strength Training",
      "durationMin": 48,
      "activeEnergyKcal": 310,
      "avgHeartRate": 128,
      "startedAt": "2026-05-26T17:20:00.000Z"
    }
  ]
}
```

## Permission Request Contract

The web layer calls:

```js
requestAppleHealthPermissions()
```

In an iOS wrapper, this should be handled by either:

- `window.EliteHealthKit.requestPermissions()`
- or `window.webkit.messageHandlers.healthKitBridge.postMessage({ type: "requestPermissions" })`

If neither bridge exists, the app uses mock data so the GitHub/web preview stays functional.

## Recovery Score Calculation

The current score is deterministic:

- Sleep duration: 24%
- Sleep quality: 20%
- HRV: 18%
- Resting heart rate: 14%
- Previous workout load: 14%
- Soreness/manual fatigue: 10%

The result is clamped from 0 to 100 and mapped into:

- Low: below 55
- Medium: 55 to 74
- High: 75 and above

## Daily Recommendation Logic

The recommendation engine uses:

- Recovery score
- Sleep quality
- HRV
- Resting heart rate
- Step count
- Recent workout count and load
- User goal

Rules:

- Poor recovery recommends rest, walking, or mobility.
- Medium recovery keeps the plan but reduces volume.
- Strong recovery allows normal or slightly higher intensity.
- Low HRV or high resting heart rate caps intensity.
- High recent workout load prevents aggressive recommendations.

## Limitations

- Real HealthKit cannot run in plain browser preview.
- Mock data is for development only.
- No backend sync exists yet.
- No Android Health Connect provider exists yet.
- No separate watchOS app is planned for MVP.
- Recommendation logic is not medical advice and should remain conservative.

## Future Improvements

- Add Capacitor or native Swift iOS shell.
- Implement real HealthKit permission request and sample queries.
- Add encrypted backend storage for user health summaries.
- Add tests around missing/partial health data.
- Add Android Health Connect provider using the same normalized model.
- Add LLM coach only after deterministic recommendations are stable.

