import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

// --- CONFIGURATION ---
const TEMP_DIR = "./generated/typedoc";
const INPUT_JSON = "./generated/typedoc/all.json"; // Path defined in your typedoc.json
const OUTPUT_DIR = "./app/www/content/2.hooks";
const README_MAIN = "./README.md";
const README_HOOKS = "./packages/hooks/README.md";
const GITHUB_REPO = "sseuniverse/sse-hooks";

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// --- HELPERS ---

function camelToKebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Parses TypeDoc types into readable strings
 */
function parseType(typeObj) {
  if (!typeObj) return "void";
  if (typeObj.type === "intrinsic") return typeObj.name;
  if (typeObj.type === "union") return typeObj.types.map(parseType).join(" | ");
  if (typeObj.type === "reference") return typeObj.name;
  if (typeObj.type === "array") return `${parseType(typeObj.elementType)}[]`;
  if (typeObj.type === "reflection" && typeObj.declaration) {
    if (typeObj.declaration.signatures) return "Function"; // Callback
    return "Object";
  }
  return "any";
}

/**
 * Extract summary text from TypeDoc comments
 */
function parseComment(comment) {
  if (!comment || !comment.summary) return "";
  return comment.summary
    .map((part) => part.text)
    .join("")
    .trim();
}

/**
 * Extract @example tag content
 */
function parseExample(blockTags) {
  if (!blockTags) return "";
  const example = blockTags.find((t) => t.tag === "@example");
  if (!example) return "";

  let content = example.content
    .map((c) => c.text)
    .join("")
    .trim();

  // 🛠️ FIX: Remove ```tsx, ```javascript, or just ``` lines
  // This prevents double-wrapping since the script adds its own fences
  content = content
    .replace(/^```[\w-]*\r?\n/gm, "") // Remove opening ```tsx
    .replace(/```\s*$/gm, ""); // Remove closing ```

  return content.trim();
}

/**
 * Fetch existing CreatedAt date to preserve it.
 * Scans folder for any file matching regex: `\d+\.${hookName}\.md`
 */
function getFileDates(hookName) {
  const now = new Date().toISOString();
  const files = fs.readdirSync(OUTPUT_DIR);

  // Find existing file regardless of the number prefix (e.g. 1.useHook.md or 5.useHook.md)
  const existingFile = files.find((f) => f.endsWith(`.${hookName}.md`));

  if (existingFile) {
    const content = fs.readFileSync(
      path.join(OUTPUT_DIR, existingFile),
      "utf-8",
    );
    const createdMatch = content.match(/createdAt: (.*)/);
    return {
      createdAt: createdMatch ? createdMatch[1].trim() : now,
      updatedAt: now,
      exists: true,
      oldFileName: existingFile,
    };
  }

  return { createdAt: now, updatedAt: now, exists: false, oldFileName: null };
}

/**
 * Fetch GitHub tags to determine "New" hooks
 */
async function getNewHooksList() {
  try {
    console.log("🔍 Fetching release tags from GitHub...");
    const tagsRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/tags`,
    );
    const tags = await tagsRes.json();

    if (!Array.isArray(tags) || tags.length < 2) return new Set();

    // Compare against the PREVIOUS tag (index 1)
    const prevTag = tags[1];
    console.log(`Checking against previous version: ${prevTag.name}`);

    const treeRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/git/trees/${prevTag.commit.sha}?recursive=1`,
    );
    const treeData = await treeRes.json();

    const oldHooks = new Set();
    treeData.tree.forEach((file) => {
      // Assuming structure packages/hooks/src/useX/useX.ts
      const match = file.path.match(
        /packages\/hooks\/src\/(use[A-Z][a-zA-Z0-9]+)/,
      );
      if (match) oldHooks.add(match[1]);
    });

    return { oldHooks, hasData: true };
  } catch (e) {
    console.warn(
      "⚠️ GitHub check failed. Marking all as existing to be safe.",
      e.message,
    );
    return { oldHooks: new Set(), hasData: false };
  }
}

// --- MAIN SCRIPT ---

async function main() {
  try {
    console.log("🔨 Running TypeDoc to generate JSON...");
    execSync("npx typedoc", { stdio: "inherit" });

    console.log("🚀 Starting Documentation Generation...");

    if (!fs.existsSync(INPUT_JSON)) {
      throw new Error(`❌ File not found: ${INPUT_JSON}`);
    }
    const data = JSON.parse(fs.readFileSync(INPUT_JSON, "utf-8"));
    const { oldHooks, hasData } = await getNewHooksList();

    // 2. Extract Hooks from TypeDoc JSON
    // Strategy: Find children that have a 'Functions' group where the function name starts with 'use'
    let hooks = [];

    if (data.children) {
      for (const module of data.children) {
        // Find the main hook function inside the module
        const funcGroup = module.groups?.find((g) => g.title === "Functions");
        if (!funcGroup) continue;

        // Get the function reflection
        const hookId = funcGroup.children[0];
        const hookFunc = module.children?.find((c) => c.id === hookId);

        if (hookFunc && hookFunc.name.startsWith("use")) {
          hooks.push({
            name: hookFunc.name,
            signature: hookFunc.signatures?.[0], // Get the first signature
            moduleName: module.name,
          });
        }
      }
    }

    // 3. Sort Alphabetically
    hooks.sort((a, b) => a.name.localeCompare(b.name));

    // 4. Generate Files
    const readmeLinks = [];
    let index = 1;

    for (const hook of hooks) {
      const { name, signature } = hook;
      if (!signature) continue;

      const kebabName = camelToKebab(name);
      const summary = parseComment(signature.comment);
      const shortDesc = summary.split(".")[0] + ".";
      const example = parseExample(signature.comment?.blockTags);

      // Determine if New
      const isNew = hasData && !oldHooks.has(name);

      // Dates
      const { createdAt, updatedAt, oldFileName } = getFileDates(name);

      // --- API SECTION (Parameters) ---
      let apiSection = "";
      if (signature.parameters?.length) {
        apiSection += `### Parameters\n\n| Name | Type | Description |\n| :--- | :--- | :--- |\n`;
        signature.parameters.forEach((p) => {
          const pDesc = parseComment(p.comment).replace(/\n/g, " ");
          apiSection += `| ${p.name} | \`${parseType(p.type)}\` | ${pDesc} |\n`;
        });
      }

      // --- API SECTION (Return Value) ---
      const returnType = parseType(signature.type);
      if (returnType !== "void") {
        const returnTag = signature.comment?.blockTags?.find(
          (t) => t.tag === "@returns",
        );
        const returnDesc = returnTag
          ? returnTag.content.map((c) => c.text).join("")
          : "";
        apiSection += `\n### Return Value\n\nReturns \`${returnType}\`.\n\n${returnDesc}`;
      }

      // --- MARKDOWN CONTENT ---
      const content = `---
title: ${name}
description: ${shortDesc.replace(/\n/g, " ")}
createdAt: ${createdAt}
updatedAt: ${updatedAt}
${isNew ? "navigation.badge: NEW" : ""}
---

## Installation

::code-group
\`\`\`bash [terminal]
npx sse-tool add ${kebabName}
\`\`\`
\`\`\`bash [npm]
npm install sse-hooks
\`\`\`
::

## Usage

::code-group
\`\`\`tsx [example.ts]
import { ${name} } from './{hooks file}'

${example || "// See usage example in source"}
\`\`\`
\`\`\`tsx [package.ts]
import { ${name} } from 'sse-hooks'

${example || "// See usage example in source"}
\`\`\`
::

## API

${apiSection || "No parameters."}
`;

      // Write File
      const newFileName = `${index}.${kebabName}.md`;

      // Remove old file if name/index changed
      if (oldFileName && oldFileName !== newFileName) {
        fs.unlinkSync(path.join(OUTPUT_DIR, oldFileName));
      }

      fs.writeFileSync(path.join(OUTPUT_DIR, newFileName), content);
      console.log(`✅ [${index}] Generated ${name} ${isNew ? "(New)" : ""}`);

      // Collect data for README
      readmeLinks.push(`- [\`${name}\`](https://sse-hooks.vercel.app/hooks/${kebabName}) — ${shortDesc}`);

      index++;
    }

    // 5. Update READMEs
    updateReadme(README_MAIN, readmeLinks);
    updateReadme(README_HOOKS, readmeLinks);
    console.log(`\n🎉 Documentation & Readmes updated!`);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  } finally {
    // 6. CLEAN UP
    if (fs.existsSync(TEMP_DIR)) {
      console.log(`🧹 Cleaning up temporary folder: ${TEMP_DIR}`);
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
  }
}

function updateReadme(filePath, links) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf-8");
  const startMarker = "<!-- HOOKS:START -->";
  const endMarker = "<!-- HOOKS:END -->";

  const regex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);
  const newContent = `${startMarker}\n\n${links.join("\n")}\n${endMarker}`;

  if (content.match(regex)) {
    fs.writeFileSync(filePath, content.replace(regex, newContent));
    console.log(`📄 Updated ${filePath}`);
  }
}

main();
