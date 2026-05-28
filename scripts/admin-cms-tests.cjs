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
    files: [],
    dataset: {},
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
for (const id of [...html.matchAll(/id="([^"]+)"/g)].map(match => match[1])) elements.set(id, el(id));
const document = {
  body: el("body"),
  documentElement: el("html"),
  getElementById(id) { if (!elements.has(id)) elements.set(id, el(id)); return elements.get(id); },
  querySelector() { return el(); },
  querySelectorAll() { return []; },
  createElement() { return el(); },
  addEventListener() {}
};
const storage = new Map();
const localStorage = { getItem(k) { return storage.get(k) || null; }, setItem(k, v) { storage.set(k, String(v)); }, removeItem(k) { storage.delete(k); } };
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
  confirm() { return true; },
  alert() {}
};
context.globalThis = context;
vm.createContext(context);
for (const [index, code] of scripts.entries()) {
  const runnable = code
    .replace("let appData = loadData();", "var appData = loadData();")
    .replace("const ENABLE_LOCAL_ADMIN_PROTOTYPE = false;", "const ENABLE_LOCAL_ADMIN_PROTOTYPE = true;")
    .replace("const exerciseMedia = {", "var exerciseMedia = {")
    .replace("const trainingPrograms = {", "var trainingPrograms = {");
  vm.runInContext(runnable, context, { filename: `script-${index + 1}.js` });
}

assert.equal(context.isAdmin(), false);
context.appData.adminPin = "2468";
document.getElementById("adminPin").value = "wrong";
assert.equal(context.adminLogin(), false);
document.getElementById("adminPin").value = "2468";
assert.equal(context.adminLogin(), true);
assert.equal(context.isAdmin(), true);

document.getElementById("admin_name").value = "Test Push";
document.getElementById("admin_description").value = "<b>Safe bodyweight press</b>";
document.getElementById("admin_muscleGroup").value = "chest";
document.getElementById("admin_imageUrl").value = "https://example.com/push.png";
document.getElementById("admin_animationUrl").value = "assets/exercise-animations/test.webm";
document.getElementById("admin_animationType").value = "webm";
document.getElementById("admin_sourceName").value = "Owner library";
document.getElementById("admin_sourceUrl").value = "https://example.com/license";
document.getElementById("admin_license").value = "Commercial";
document.getElementById("admin_attributionText").value = "Licensed asset";
assert.equal(context.saveAdminItem("exercises"), true);
assert.equal(context.exerciseMedia["Test Push"].animationType, "webm");
assert.equal(context.exerciseMedia["Test Push"].description.includes("<"), false);

document.getElementById("admin_id").value = "fatLoss";
document.getElementById("admin_goal").value = "fat";
document.getElementById("admin_calorieDelta").value = "-250";
document.getElementById("admin_proteinPerKg").value = "2.1";
document.getElementById("admin_fatPerKg").value = "0.8";
document.getElementById("admin_trainingCarbShift").value = "140";
document.getElementById("admin_restCarbShift").value = "-120";
assert.equal(context.saveAdminItem("nutritionRules", "fatLoss"), true);
assert.equal(context.appData.nutritionRules.find(rule => rule.id === "fatLoss").proteinPerKg, 2.1);

assert.throws(() => context.sanitizeAdminUrl("javascript:alert(1)"));
const badInput = { files: [{ type: "text/plain", size: 100 }], value: "x" };
context.adminHandleUpload(badInput, "admin_imageUrl", "image");
assert.equal(badInput.value, "");

context.deleteAdminItem("exercises", "Test Push");
assert.equal(context.exerciseMedia["Test Push"], undefined);

console.log("admin CMS tests passed");
