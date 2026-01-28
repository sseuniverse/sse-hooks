import { $, fs, path, quote } from "zx";
$.quote = quote;

import { getHooks } from "./utils/get-hooks.js";
import { generateDocFiles } from "./utils/generate-doc-files.js";
import { updateReadme } from "./utils/update-readme.js";

const generatedDir = path.resolve("./generated");

// ✅ Clean dirs safely (no rimraf CLI)
fs.rmSync(path.join(generatedDir, "docs"), { recursive: true, force: true });
fs.rmSync(path.join(generatedDir, "typedoc"), { recursive: true, force: true });

// Generate base from JSDoc comments using typedoc
await $`typedoc`;

const hooks = getHooks();

fs.mkdirSync(path.join(generatedDir, "docs", "hooks"), { recursive: true });

for (const hook of hooks) {
  generateDocFiles(hook);
}

fs.writeFileSync(
  path.join(generatedDir, "docs", "hooks.json"),
  JSON.stringify(hooks, null, 2),
);

console.log(`Generated documentation for ${hooks.length} hooks.`);

updateReadme(hooks);
console.log("Documentation generated successfully.");
