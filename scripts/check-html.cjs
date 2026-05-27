const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]);

if (!scripts.length) {
  console.error("No inline <script> blocks found in index.html.");
  process.exit(1);
}

const results = scripts.map((code, index) => {
  try {
    new Function(code);
    return { script: index + 1, ok: true, length: code.length };
  } catch (error) {
    return { script: index + 1, ok: false, error: error.message };
  }
});

for (const result of results) {
  if (result.ok) {
    console.log(`script ${result.script}: ok (${result.length} chars)`);
  } else {
    console.error(`script ${result.script}: ${result.error}`);
  }
}

if (results.some(result => !result.ok)) {
  process.exit(1);
}
