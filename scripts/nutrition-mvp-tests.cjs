const assert = require("node:assert/strict");

const foods = [
  { id: "oats", tags: ["vegan", "gluten"] },
  { id: "yogurt", tags: ["vegetarian", "dairy"] },
  { id: "rice", tags: ["vegan"] },
  { id: "chicken", tags: ["omnivore"] }
];

const recipes = [
  { id: "oats", meal: "breakfast", ingredients: ["oats", "yogurt"], preferences: ["vegetarian"] },
  { id: "chickenRice", meal: "lunch", ingredients: ["chicken", "rice"], preferences: ["omnivore", "highProtein"] }
];

const rules = {
  fat: { calorieDelta: -350, proteinPerKg: 2.0, fatPerKg: 0.8 },
  muscle: { calorieDelta: 250, proteinPerKg: 1.8, fatPerKg: 0.9 }
};

function calculateBMR(profile) {
  const base = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
  return Math.round(base + (profile.gender === "female" ? -161 : 5));
}

function calculateTDEE(profile) {
  const factors = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
  return Math.round(calculateBMR(profile) * factors[profile.activityLevel]);
}

function adjustedCalories(tdee, goal, profile) {
  const delta = profile.healthRisks?.length && rules[goal].calorieDelta < 0 ? -150 : rules[goal].calorieDelta;
  return Math.max(1400, Math.round(tdee + delta));
}

function calculateMacros(profile, goal, dayType) {
  const calories = adjustedCalories(calculateTDEE(profile), goal, profile) + (dayType === "training" ? 120 : -100);
  const protein = Math.round(profile.weight * rules[goal].proteinPerKg);
  const fat = Math.max(Math.round(profile.weight * rules[goal].fatPerKg), Math.round((calories * 0.2) / 9));
  const carbs = Math.max(80, Math.round((calories - protein * 4 - fat * 9) / 4));
  return { calories, protein, carbs, fat };
}

function recipeMatchesProfile(recipe, profile) {
  const tags = new Set(recipe.ingredients.flatMap(foodId => foods.find(food => food.id === foodId)?.tags || []));
  return !profile.allergies.some(allergy => tags.has(allergy));
}

function ExerciseMotionPreview(media) {
  if (media.animationUrl && ["gif", "webm", "mp4"].includes(media.animationType)) return "<video autoplay loop muted playsinline></video>";
  if (media.img) return "<img loading=\"lazy\">";
  return "<div class=\"exercise-motion-fallback\"></div>";
}

const profile = { gender: "male", age: 30, height: 180, weight: 80, activityLevel: "moderate", allergies: [], healthRisks: [] };

assert.equal(calculateBMR(profile), 1780);
assert.equal(calculateTDEE(profile), 2759);
assert.equal(adjustedCalories(2759, "fat", profile), 2409);
assert.equal(adjustedCalories(2759, "muscle", profile), 3009);

const training = calculateMacros(profile, "fat", "training");
const rest = calculateMacros(profile, "fat", "rest");
assert.equal(training.protein, 160);
assert.ok(training.carbs > rest.carbs);
assert.ok(training.calories > rest.calories);

assert.equal(recipeMatchesProfile(recipes[0], { allergies: ["dairy"] }), false);
assert.equal(recipeMatchesProfile(recipes[1], { allergies: ["dairy"] }), true);

assert.match(ExerciseMotionPreview({ animationUrl: "demo.webm", animationType: "webm", img: "fallback.jpg" }), /video/);
assert.match(ExerciseMotionPreview({ animationType: "none", img: "fallback.jpg" }), /img/);
assert.match(ExerciseMotionPreview({}), /fallback/);

console.log("nutrition MVP tests passed");
