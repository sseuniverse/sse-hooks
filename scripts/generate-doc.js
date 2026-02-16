import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import prettier from "prettier";

// --- CONFIGURATION ---
const TEMP_DIR = "./generated/typedoc";
const INPUT_JSON = "./generated/typedoc/all.json"; // Path defined in your typedoc.json
const OUTPUT_DIR = "./app/www/content/docs/2.hooks";
const README_MAIN = "./README.md";
const README_HOOKS = "./packages/hooks/README.md";
const GITHUB_REPO = "sseuniverse/sse-hooks";
const HOOKS_SRC_DIR = "./packages/hooks/src";

// Define Category Order / Mapping
const CATEGORY_MAP = {
  sensors: "📡 Sensors",
  state: "💾 State",
  effect: "⚡ Side Effects",
  lifecycle: "🔄 LifeCycle",
  dom: "🎨 DOM & UI",
  storage: "📦 Storage",
  network: "🌐 Network",
  form: "📝 Form",
  animation: "✨ Animation",
  utilities: "🛠️ Utilities",
  uncategorized: "📦 Uncategorized",
};

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// --- HELPERS ---

function camelToKebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

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

function parseComment(comment) {
  if (!comment || !comment.summary) return "";
  return comment.summary
    .map((part) => part.text)
    .join("")
    .trim();
}

function parseCategory(blockTags) {
  if (!blockTags) return "uncategorized";
  const category = blockTags.find((t) => t.tag === "@category");
  return category
    ? category.content
        .map((c) => c.text)
        .join("")
        .trim()
        .toLowerCase()
    : "uncategorized";
}

function parseExample(blockTags) {
  if (!blockTags) return "";
  const example = blockTags.find((t) => t.tag === "@example");
  if (!example) return "";

  let content = example.content
    .map((c) => c.text)
    .join("")
    .trim();

  content = content.replace(/^```[\w-]*\r?\n/gm, "").replace(/```\s*$/gm, "");
  return content.trim();
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

    const prevTag = tags[1];
    console.log(`Checking against previous version: ${prevTag.name}`);

    const treeRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/git/trees/${prevTag.commit.sha}?recursive=1`,
    );
    const treeData = await treeRes.json();

    const oldHooks = new Set();
    treeData.tree.forEach((file) => {
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

function parseFrontMatter(fileContent) {
  const match = fileContent.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/);

  if (!match) {
    return { attributes: {}, body: fileContent };
  }

  const frontMatterBlock = match[1];
  const body = match[2].trim();
  const attributes = {};

  frontMatterBlock.split("\n").forEach((line) => {
    const parts = line.split(":");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join(":").trim();
      attributes[key] = value;
    }
  });

  return { attributes, body };
}

/**
 * GENERATE .navigation.yml
 */
function generateNavigationFile() {
  const content = `title: Hooks
icon: i-lucide-square-function
`;
  fs.writeFileSync(path.join(OUTPUT_DIR, ".navigation.yml"), content);
  console.log("✅ Generated .navigation.yml");
}

/**
 * GENERATE 0.index.md
 */
function generateIndexFile(hooks) {
  // Group hooks by category
  const categorizedHooks = {};

  // Initialize categories
  Object.keys(CATEGORY_MAP).forEach((key) => (categorizedHooks[key] = []));

  hooks.forEach((hook) => {
    // Determine category key (default to uncategorized if not found in map)
    const catKey = CATEGORY_MAP[hook.category]
      ? hook.category
      : "uncategorized";
    categorizedHooks[catKey].push(hook);
  });

  let indexContent = `---
title: Hooks
description: A comprehensive collection of React hooks for sensors, state management, side effects, and more.
seo:
  title: React Hooks Collection
navigation: false
---

`;

  // Build sections based on CATEGORY_MAP order
  for (const [key, title] of Object.entries(CATEGORY_MAP)) {
    const categoryHooks = categorizedHooks[key];

    if (categoryHooks && categoryHooks.length > 0) {
      indexContent += `## ${title.split(" ")[1] || title}

::card-group
`;

      categoryHooks.forEach((hook) => {
        indexContent += `  :::card
  ---
  title: ${hook.name}
  to: /docs/hooks/${hook.kebabName}
  ---
  ${hook.shortDesc}
  :::

`;
      });

      indexContent += `::\n\n`;
    }
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, "0.index.md"), indexContent);
  console.log("✅ Generated 0.index.md");
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

    let hooks = [];
    if (data.children) {
      for (const module of data.children) {
        const funcGroup = module.groups?.find((g) => g.title === "Functions");
        if (!funcGroup) continue;

        const hookId = funcGroup.children[0];
        const hookFunc = module.children?.find((c) => c.id === hookId);

        if (hookFunc && hookFunc.name.startsWith("use")) {
          hooks.push({
            name: hookFunc.name,
            signature: hookFunc.signatures?.[0],
            moduleName: module.name,
          });
        }
      }
    }

    hooks.sort((a, b) => a.name.localeCompare(b.name));

    // Store categorized links for README
    const processedHooks = [];
    const categorizedLinks = {};
    Object.keys(CATEGORY_MAP).forEach((k) => (categorizedLinks[k] = []));

    let index = 1;

    for (const hook of hooks) {
      const { name, signature } = hook;
      if (!signature) continue;

      const kebabName = camelToKebab(name);

      // 1. Get Auto-Generated Info
      const autoSummary = parseComment(signature.comment);
      const autoCategory = parseCategory(signature.comment?.blockTags);
      const autoDesc = autoSummary.split(".")[0] + ".";
      const isNew = hasData && !oldHooks.has(name);
      const example = await prettier.format(
        parseExample(signature.comment?.blockTags),
        {
          parser: "typescript",
          semi: true,
          singleQuote: false,
          trailingComma: "all",
          printWidth: 80,
        },
      );

      const manualDocPath = path.join(HOOKS_SRC_DIR, name, "docs.md");
      let manualData = { attributes: {}, body: "" };

      if (fs.existsSync(manualDocPath)) {
        manualData = parseFrontMatter(fs.readFileSync(manualDocPath, "utf-8"));
      }

      const finalTitle =
        manualData.attributes.title || manualData.attributes.name || name;

      const finalCategory = manualData.attributes.category
        ? manualData.attributes.category.toLowerCase()
        : autoCategory;

      const finalDesc = manualData.attributes.description || autoDesc;

      // Normalize category (default to utils if unknown, or keep uncategorized)
      const validCategory = CATEGORY_MAP[finalCategory]
        ? finalCategory
        : "uncategorized";

      // Save processed data
      processedHooks.push({
        name: finalTitle,
        kebabName,
        category: validCategory,
        shortDesc: finalDesc,
      });

      // --- DOC FILE GENERATION ---
      let apiSection = "";
      if (signature.parameters?.length) {
        apiSection += `### Parameters\n\n| Name | Type | Description |\n| :--- | :--- | :--- |\n`;
        signature.parameters.forEach((p) => {
          const pDesc = parseComment(p.comment).replace(/\n/g, " ");
          apiSection += `| ${p.name} | \`${parseType(p.type)}\` | ${pDesc} |\n`;
        });
      }

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

      let middleContent = "";

      if (manualData.body) {
        // If manual body exists, USE IT EXACTLY AS IS.
        // We do NOT add a "## Usage" wrapper here, because your manual body likely has its own structure.
        middleContent = manualData.body;
      } else {
        // If no manual body, fall back to the default generated usage section.
        middleContent = `
\`\`\`tsx [example.ts]
import { ${name} } from './{hooks file}'

${example || "// See usage example in source"}
\`\`\`
`;
      }

      const content = `---
title: ${finalTitle}
description: ${finalDesc.replace(/\n/g, " ")}${isNew ? "\nnavigation.badge: NEW" : ""}
category: ${validCategory}
links:
  - label: GitHub
    icon: i-simple-icons-github
    to: https://github.com/sseuniverse/sse-hooks/blob/main/packages/hooks/src/${name}
---

## Installation

::code-group

\`\`\`bash [npm]
npx sse-hooks add ${kebabName}
\`\`\`
\`\`\`bash [yarn]
yarn dlx sse-hooks add ${kebabName}
\`\`\`
\`\`\`bash [pnpm]
pnpm dlx sse-hooks add ${kebabName}
\`\`\`
\`\`\`bash [deno]
deno run -A npm:sse-hooks add ${kebabName}
\`\`\`
\`\`\`bash [bun]
bunx sse-hooks add ${kebabName}
\`\`\`

::

## Usage

${middleContent}

## API

${apiSection || "No parameters."}

## Changelog

:hooks-changelog
`;

      const newFileName = `${index}.${kebabName}.md`;
      fs.writeFileSync(
        path.join(OUTPUT_DIR, newFileName),
        await prettier.format(content.toString(), {
          parser: "markdown",
          printWidth: 80,
        }),
      );
      console.log(`✅ [${index}] Generated ${name} ${isNew ? "(New)" : ""}`);

      // Add to Category List
      categorizedLinks[validCategory].push(
        `- [\`${name}\`](https://sse-hooks.vercel.app/docs/hooks/${kebabName}) — ${finalDesc}`,
      );

      index++;
    }

    // --- GENERATE SPECIAL FILES ---
    generateNavigationFile();
    generateIndexFile(processedHooks);

    // 5. Update READMEs with Categorized Lists
    const readmeContent = generateReadmeContent(categorizedLinks);
    updateReadme(README_MAIN, readmeContent);
    updateReadme(README_HOOKS, readmeContent);

    console.log(`\n🎉 Documentation & Readmes updated!`);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  } finally {
    if (fs.existsSync(TEMP_DIR)) {
      console.log(`🧹 Cleaning up temporary folder: ${TEMP_DIR}`);
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
  }
}

function generateReadmeContent(categorizedLinks) {
  let output = "";

  for (const [key, title] of Object.entries(CATEGORY_MAP)) {
    const links = categorizedLinks[key];
    if (links && links.length > 0) {
      output += `### ${title}\n${links.join("\n")}\n\n`;
    }
  }

  return output.trim();
}

function updateReadme(filePath, newContent) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf-8");
  const startMarker = "<!-- HOOKS:START -->";
  const endMarker = "<!-- HOOKS:END -->";

  const regex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);
  const replacement = `${startMarker}\n\n${newContent}\n${endMarker}`;

  if (content.match(regex)) {
    fs.writeFileSync(filePath, content.replace(regex, replacement));
    console.log(`📄 Updated ${filePath}`);
  }
}

main();
