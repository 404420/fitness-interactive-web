const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]);

function el(id = "") {
  return {
    id,
    innerHTML: "",
    textContent: "",
    value: "",
    placeholder: "",
    dataset: {},
    disabled: false,
    style: { removeProperty() {}, setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener() {},
    setAttribute() {},
    getBoundingClientRect() { return { left: 0, width: 0 }; }
  };
}

const elements = new Map();
for (const id of [...html.matchAll(/id="([^"]+)"/g)].map(match => match[1])) {
  elements.set(id, el(id));
}

const document = {
  body: el("body"),
  documentElement: el("html"),
  getElementById(id) {
    if (!elements.has(id)) elements.set(id, el(id));
    return elements.get(id);
  },
  querySelector() { return el(); },
  querySelectorAll() { return []; },
  createElement() { return el(); },
  addEventListener() {}
};

const storage = new Map();
const localStorage = {
  getItem(key) { return storage.get(key) || null; },
  setItem(key, value) { storage.set(key, String(value)); },
  removeItem(key) { storage.delete(key); }
};

const context = {
  console,
  document,
  localStorage,
  window: { scrollTo() {}, addEventListener() {}, IntersectionObserver: undefined },
  setTimeout() {},
  clearTimeout() {},
  setInterval() {},
  clearInterval() {},
  structuredClone: global.structuredClone,
  Date,
  Math,
  JSON,
  Number,
  String,
  Object,
  Array,
  alert() {}
};
context.globalThis = context;

vm.createContext(context);
for (const [index, code] of scripts.entries()) {
  const runnable = code
    .replace("let appData = loadData();", "var appData = loadData();")
    .replace("const exerciseMedia = {", "var exerciseMedia = {");
  vm.runInContext(runnable, context, { filename: `script-${index + 1}.js` });
}

document.getElementById("mealProtein").placeholder = "Valk g";
document.getElementById("mealCarbs").placeholder = "Süsivesikud g";
document.getElementById("mealFat").placeholder = "Rasv g";
document.getElementById("planOutput").innerHTML = "";

context.appData.profile.gender = "male";
context.appData.profile.age = 31;
context.appData.profile.height = 181;
context.appData.profile.weight = 84;
context.appData.selectedProgram = "generalMuscle";
context.appData.nutritionProfile = {
  activityLevel: "moderate",
  trainingDays: 4,
  allergies: [],
  dietPreferences: [],
  healthRisks: [],
  mealsPerDay: 4
};

assert.equal(context.generateProgramPlan("generalMuscle"), true);
const firstPlanHtml = document.getElementById("planOutput").innerHTML;
assert.match(firstPlanHtml, /exercise-card/);
assert.match(firstPlanHtml, /exercise-motion-preview/);
assert.match(firstPlanHtml, /Nutrition Plan/);
assert.match(firstPlanHtml, /programNutritionPlanOutput/);
assert.doesNotMatch(firstPlanHtml, /Laen liikumist/);

const result = context.generateNutritionPlanForSelectedProgram("generalMuscle");
assert.equal(result.ok, true);
assert.equal(result.plan.trainingPlanId, "generalMuscle");
assert.equal(result.plan.profileSnapshot.trainingPlanId, "generalMuscle");

const programNutritionHtml = document.getElementById("programNutritionPlanOutput").innerHTML;
assert.match(programNutritionHtml, /BMR/);
assert.match(programNutritionHtml, /TDEE/);
assert.match(programNutritionHtml, /Treeningp|treeningp/i);

const fatLossResult = context.generateNutritionPlan("local", "fatLossCircuit");
assert.equal(fatLossResult.ok, true);
assert.equal(fatLossResult.plan.trainingPlanId, "fatLossCircuit");
assert.notEqual(fatLossResult.plan.goal, result.plan.goal);
assert.notEqual(fatLossResult.plan.days[0].macros.calories, result.plan.days[0].macros.calories);

console.log("program integration tests passed");
