# AI Fitness Coach MVP Roadmap

## 1. Current App Structure Summary

The app is currently a single-page web app in `index.html`, with all UI, state, workout data, recovery logic, and local persistence handled in the browser. It uses `localStorage` through `eliteFitnessData` as the main client-side store. The project also has a lightweight HTML validation script in `scripts/check-html.cjs` and an npm `check` command.

Main product areas already present:
- Home dashboard
- User profile and body type selection
- Workout plan library and program detail pages
- Live workout tracking UI
- Recovery/sleep page
- Water tracking
- Nutrition summary and meal logging
- Outdoor gym locations and equipment-based workout plans
- Settings and onboarding

## 2. What Is Already Implemented

- Basic onboarding and profile fields
- Goal selection and selected training program state
- Workout history storage
- Dashboard summary cards
- Workout plan library with several deterministic plans
- Outdoor gym browsing and location-based workout plans
- Manual recovery inputs: sleep, sleep quality, resting heart rate, HRV, load, soreness
- Basic recovery/readiness calculation
- Basic adaptive workout recommendation text
- Mock wearable/live workout UI
- Local persistence in `localStorage`

## 3. What Is Missing For MVP

- Real auth and account persistence
- Production database
- HealthKit/native iOS bridge
- Normalized health data model
- Clear separation between raw health samples, normalized daily health summary, recovery calculation, and workout recommendation
- Robust daily recommendation engine based on recent workouts and user goal
- Backend API or server actions
- Privacy and consent handling for health data
- App Store-ready iOS packaging
- Error handling for denied HealthKit permissions
- Sync status and data freshness indicators

## 4. Recommended MVP Feature List

Core MVP promise: help the user train smarter every day based on recovery and health data.

MVP should include:
- User profile and fitness goal
- Health data sync foundation for Apple Health / HealthKit
- Mock/manual fallback when HealthKit is unavailable or denied
- Daily health summary: sleep, sleep stages, resting heart rate, HRV, steps, recent workouts
- Recovery/readiness score
- Daily workout recommendation
- Workout plan library
- Outdoor gym map/location feature
- Simple dashboard that shows recovery, sleep score, and recommended intensity
- Local-first prototype behavior, with a path to backend sync

## 5. What Should Be Cut Or Postponed

Postpone:
- AI chat coach
- Nutrition engine beyond simple guidance
- Social/community features
- Complex analytics
- Separate watchOS app
- Payments/subscription logic
- Advanced charts
- Android Health Connect implementation
- LLM API integration

Cut from MVP unless needed for testing:
- Large feature redesigns
- Extra dependencies
- Full backend rewrite
- Complex custom recommendation ML

## 6. Technical Roadmap

### Week 1

- Create normalized health data model.
- Add HealthKit bridge interface for future iOS wrapper.
- Keep browser preview working with mock/manual health data.
- Refactor recovery calculation to consume normalized health data.
- Add dashboard recovery card with source/freshness state.
- Create `HEALTHKIT_SETUP.md`.

### Week 2

- Build deterministic daily recommendation engine.
- Use recovery score, sleep, HRV, resting heart rate, steps, recent workouts, and selected goal.
- Add recommendation reason text.
- Add simple workout templates for recovery, moderate, and high-intensity days.
- Store daily recommendation snapshots.

### Week 3

- Add backend-ready data contracts.
- Add auth/profile planning.
- Prepare API route structure or server action contracts.
- Add privacy/consent copy for health data.
- Add basic test coverage for recovery and recommendation logic.

### Week 4

- Start iOS wrapper plan.
- Implement real HealthKit permission request and data fetch in native layer.
- Feed HealthKit samples into the existing normalized web model.
- Test denied permissions, partial data, stale data, and no-watch scenarios.
- Polish MVP onboarding around health sync and daily recommendation.

## 7. Suggested Database Schema

Future backend tables:

- `users`
  - `id`
  - `email`
  - `created_at`
  - `updated_at`

- `profiles`
  - `user_id`
  - `name`
  - `gender`
  - `height_cm`
  - `weight_kg`
  - `age`
  - `fitness_goal`
  - `experience_level`

- `health_daily_summaries`
  - `id`
  - `user_id`
  - `date`
  - `source`
  - `sleep_minutes`
  - `sleep_score`
  - `rem_minutes`
  - `core_minutes`
  - `deep_minutes`
  - `awake_minutes`
  - `resting_heart_rate`
  - `hrv_ms`
  - `steps`
  - `active_energy_kcal`
  - `synced_at`

- `workouts`
  - `id`
  - `user_id`
  - `source`
  - `started_at`
  - `ended_at`
  - `type`
  - `duration_min`
  - `active_energy_kcal`
  - `avg_heart_rate`
  - `load_score`

- `recovery_scores`
  - `id`
  - `user_id`
  - `date`
  - `score`
  - `sleep_component`
  - `hrv_component`
  - `heart_rate_component`
  - `load_component`
  - `soreness_component`

- `daily_recommendations`
  - `id`
  - `user_id`
  - `date`
  - `recommended_intensity`
  - `program_id`
  - `workout_type`
  - `reason`
  - `created_at`

## 8. Suggested Frontend Pages / Components

- `Dashboard`
  - `HealthSummaryCard`
  - `DailyRecommendationCard`
  - `WorkoutProgressSummary`

- `Recovery`
  - `HealthSyncStatus`
  - `RecoveryScoreCard`
  - `SleepStagesCard`
  - `ManualHealthFallbackForm`

- `Workout Plans`
  - `PlanLibrary`
  - `ProgramDetail`
  - `AdaptiveWorkoutBanner`

- `Outdoor Gyms`
  - `OutdoorGymList`
  - `OutdoorGymMap`
  - `OutdoorEquipmentPlan`

- `Settings`
  - `ProfileForm`
  - `HealthPermissionControls`
  - `DataExportImport`

## 9. Suggested API Routes / Server Actions

Future routes:

- `POST /api/auth/session`
- `GET /api/profile`
- `PUT /api/profile`
- `POST /api/health/daily-summary`
- `GET /api/health/daily-summary?date=YYYY-MM-DD`
- `POST /api/workouts/import`
- `GET /api/workouts/recent`
- `POST /api/recovery/calculate`
- `GET /api/recommendations/today`
- `POST /api/recommendations/generate`

For iOS HealthKit, the native layer should collect permissioned health samples and send normalized daily summaries to the web/app layer or backend.

## 10. Suggested AI Recommendation Logic

Do not use an LLM for MVP recommendations. Start deterministic and explainable.

Inputs:
- Sleep duration
- Sleep quality
- Sleep stage balance
- Resting heart rate
- HRV
- Steps
- Recent workout load
- Soreness/manual fatigue
- User goal

Rules:
- Poor recovery: rest, mobility, walking, or very light outdoor gym work.
- Medium recovery: keep planned workout but reduce sets or load.
- Strong recovery: allow normal or slightly higher intensity.
- High recent load: avoid high-intensity recommendation.
- Low HRV or high resting heart rate: cap intensity.
- Goal-specific logic chooses program type.

Output:
- Recovery score
- Recommended intensity
- Suggested workout type/template
- Reason text
- Safety warning when overtraining risk is high

## 11. Risks And Technical Debt

- Single-file app is fast to ship but will become hard to maintain.
- Browser preview cannot directly access Apple HealthKit.
- Health data is sensitive and needs explicit consent, privacy copy, and secure storage.
- `localStorage` is not enough for production accounts or cross-device sync.
- Current UI/data logic is tightly coupled.
- Recommendation logic must stay explainable to avoid unsafe advice.
- Watch data may be missing, delayed, partial, or denied by user permissions.

## 12. Exact Next Coding Tasks In Priority Order

1. Add normalized health data model and mock HealthKit fallback.
2. Add HealthKit bridge contract for future iOS wrapper.
3. Refactor recovery score to consume normalized daily health data.
4. Add dashboard Health/Recovery card with data source status.
5. Add deterministic daily workout recommendation service.
6. Add recommendation UI card.
7. Document HealthKit architecture in `HEALTHKIT_SETUP.md`.
8. Add tests for score and recommendation logic.
9. Add iOS wrapper implementation plan.
10. Add backend schema migration when backend choice is confirmed.

