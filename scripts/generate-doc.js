import { $, fs, path, quote } from "zx";
$.quote = quote;

import { getHooks } from "./utils/get-hooks.js";
import { updateReadme } from "./utils/update-readme.js";

const generatedDir = path.resolve("./generated");

// ✅ Clean dirs safely (no rimraf CLI)
fs.rmSync(path.join(generatedDir, "docs"), { recursive: true, force: true });
fs.rmSync(path.join(generatedDir, "typedoc"), { recursive: true, force: true });

// Generate base from JSDoc comments using typedoc
await $`typedoc`;

const hooks = getHooks();

updateReadme(hooks);
console.log("Documentation generated successfully.");
