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
    style: { removeProperty() {}, setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener() {},
    setAttribute() {}
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

const localStorage = {
  getItem() { return null; },
  setItem() {},
  removeItem() {}
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
  const runnable = code.replace("const exerciseMedia = {", "var exerciseMedia = {");
  vm.runInContext(runnable, context, { filename: `script-${index + 1}.js` });
}

context.exerciseMedia.MotionVideo = {
  imageUrl: "fallback.jpg",
  img: "fallback.jpg",
  animationUrl: "motion.webm",
  animationType: "webm",
  sourceName: "Video source",
  sourceUrl: "https://example.com/video",
  license: "Test license",
  attributionText: "Video attribution"
};
context.exerciseMedia.MotionGif = {
  imageUrl: "fallback.jpg",
  img: "fallback.jpg",
  animationUrl: "motion.gif",
  animationType: "gif",
  sourceName: "GIF source",
  sourceUrl: "https://example.com/gif",
  license: "GIF license",
  attributionText: "GIF attribution"
};
context.exerciseMedia.StaticOnly = {
  imageUrl: "static.jpg",
  img: "static.jpg",
  animationType: "none",
  sourceName: "Static source",
  sourceUrl: "https://example.com/static",
  license: "Static license",
  attributionText: "Static attribution"
};

const videoHtml = context.ExerciseMotionPreview("MotionVideo");
assert.match(videoHtml, /<video/);
assert.match(videoHtml, /autoplay/);
assert.match(videoHtml, /loop/);
assert.match(videoHtml, /muted/);
assert.match(videoHtml, /playsinline/);
assert.match(videoHtml, /exercise-motion-loading/);
assert.match(videoHtml, /Video attribution/);
assert.match(videoHtml, /Test license/);

const gifHtml = context.ExerciseMotionPreview("MotionGif");
assert.match(gifHtml, /<img/);
assert.doesNotMatch(gifHtml, /<video/);
assert.match(gifHtml, /motion\.gif/);
assert.match(gifHtml, /GIF attribution/);

const staticHtml = context.ExerciseMotionPreview("StaticOnly");
assert.match(staticHtml, /static\.jpg/);
assert.match(staticHtml, /Static source/);
assert.match(staticHtml, /Static license/);

const fallbackHtml = context.ExerciseMotionPreview("DefinitelyMissingExercise");
assert.match(fallbackHtml, /exercise-motion-preview/);
assert.match(fallbackHtml, /No media/);

console.log("exercise motion tests passed");
