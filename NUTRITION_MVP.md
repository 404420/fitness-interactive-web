# Nutrition MVP

The app is currently a single-page `index.html` app using `localStorage` as its persistence layer. The requested database tables are represented as structured collections in `appData`:

- `nutritionProfiles`
- `foods`
- `recipes`
- `recipeIngredients`
- `mealTemplates`
- `generatedMealPlans`
- `generatedMeals`
- `allergies`
- `userAllergies`
- `dietPreferences`
- `userDietPreferences`
- `nutritionRules`

## Calculation basis

The MVP uses Mifflin-St Jeor BMR, activity-factor TDEE, goal-based calorie adjustment, protein by bodyweight, a minimum fat target, and carbohydrates from remaining calories. Training days get more carbohydrate calories than rest days.

Reference principles:

- WHO healthy diet: vegetables, fruit, whole grains, lower free sugar/sodium/saturated fat.
- ISSN sports nutrition: active people commonly use about 1.4-2.0 g protein/kg/day.
- NHS Eatwell Guide and Mayo Clinic: balanced meals from vegetables/fruit, whole grains and lean protein.

Disclaimer shown in the app:

> See toitumiskava on üldine fitness-soovitus ega asenda arsti või dietoloogi nõu.

If a user marks pregnancy, diabetes, eating disorder, kidney disease, or another high health risk, the app avoids aggressive dieting and recommends specialist advice.

## Animation assets

Exercise motion is rendered through `ExerciseMotionPreview`. Add licensed `.webm`, `.mp4`, or `.gif` files under `assets/exercise-animations/` and set `animationUrl`, `animationType`, `sourceName`, `sourceUrl`, `license`, and `attributionText` in `exerciseMedia`.
