import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import prettier from "prettier";

// Internal Module Imports
import * as config from "./config";
import * as parser from "./utils/parser";
import * as github from "./utils/github";
import * as readme from "./utils/readme";
import * as format from "./utils/formatter";
import * as fsTools from "./utils/fs-tools";
import { HookData, ProcessedHook, TypeDocChild } from "./types";

async function main() {
  try {
    fsTools.ensureDirectory(config.OUTPUT_DIR);
    console.log("🔨 Running TypeDoc to generate JSON...");
    execSync("npx typedoc", { stdio: "inherit" });

    if (!fs.existsSync(config.INPUT_JSON)) {
      throw new Error(`❌ File not found: ${config.INPUT_JSON}`);
    }

    const data = JSON.parse(fs.readFileSync(config.INPUT_JSON, "utf-8"));
    const { oldHooks, hasData } = await github.getNewHooksList(
      config.GITHUB_REPO,
    );

    let rawHooks: HookData[] = [];
    if (data.children) {
      for (const module of data.children as TypeDocChild[]) {
        const funcGroup = module.groups?.find((g) => g.title === "Functions");
        if (!funcGroup) continue;

        const hookId = funcGroup.children[0];
        const hookFunc = module.children?.find((c) => c.id === hookId);

        if (hookFunc && hookFunc.name.startsWith("use")) {
          rawHooks.push({
            name: hookFunc.name,
            signature: hookFunc.signatures?.[0],
            moduleName: module.name,
          });
        }
      }
    }

    rawHooks.sort((a, b) => a.name.localeCompare(b.name));
    const processedHooks: ProcessedHook[] = [];
    const categorizedLinks: Record<string, string[]> = {};
    Object.keys(config.CATEGORY_MAP).forEach((k) => (categorizedLinks[k] = []));

    let index = 1;

    for (const hook of rawHooks) {
      const { name, signature } = hook;
      if (!signature) continue;

      const kebabName = format.camelToKebab(name);
      const autoSummary = parser.parseComment(signature.comment);
      const autoCategory = parser.parseCategory(signature.comment);

      const isNew = hasData && !oldHooks.has(name);
      const rawExample = parser.parseExample(signature.comment);

      const formattedExample = rawExample
        ? await prettier.format(rawExample, {
            parser: "typescript",
            printWidth: 80,
          })
        : "// See usage example in source";

      // Handle Manual Overrides (docs.md)
      const manualDocPath = path.join(config.HOOKS_SRC_DIR, name, "docs.md");
      let manualData = { attributes: {} as Record<string, string>, body: "" };

      if (fs.existsSync(manualDocPath)) {
        manualData = parser.parseFrontMatter(
          fs.readFileSync(manualDocPath, "utf-8"),
        );
      }

      const finalTitle = manualData.attributes.title || name;
      const finalCategory =
        manualData.attributes.category?.toLowerCase() || autoCategory;
      const finalDesc = manualData.attributes.description || autoSummary;
      const validCategory = config.CATEGORY_MAP[finalCategory]
        ? finalCategory
        : "uncategorized";

      processedHooks.push({
        name: finalTitle,
        kebabName,
        category: validCategory,
        shortDesc: format.getShortDescription(finalDesc),
      });

      // 5. Generate Content
      const mdnMatch = finalDesc.match(
        /https:\/\/developer\.mozilla\.org[^\s)\]]+/,
      );
      const mdnUrl = mdnMatch ? mdnMatch[0] : null;

      let linksYaml = `links:\n  - label: GitHub\n    icon: i-simple-icons-github\n    to: https://github.com/${config.GITHUB_REPO}/blob/main/packages/hooks/src/${name}`;
      if (mdnUrl)
        linksYaml += `\n  - label: MDN Docs\n    icon: i-simple-icons-mdnwebdocs\n    to: ${mdnUrl}`;

      const safeDesc = format.cleanDescriptionForYaml(finalDesc);
      const middleContent =
        manualData.body ||
        `\n\`\`\`tsx [example.ts]\nimport { ${name} } from './{hooks file}'\n\n${formattedExample}\n\`\`\`\n`;

      const markdown = `---
title: ${finalTitle}
description: "${safeDesc}"${isNew ? "\nnavigation.badge: NEW" : ""}
category: ${validCategory}
${linksYaml}
---

## Installation

::code-group{sync="pm"}
\`\`\`bash [npm]
npx sse-hooks add ${kebabName}
\`\`\`
::

## Usage

${middleContent}

## API

### Parameters
:component-props

### Returns
:component-props{type="returns"}

## Changelog
:hooks-changelog
`;

      fs.writeFileSync(
        path.join(config.OUTPUT_DIR, `${index}.${kebabName}.md`),
        await prettier.format(markdown, { parser: "markdown", printWidth: 80 }),
      );

      categorizedLinks[validCategory].push(
        `- [\`${name}\`](https://sse-hooks.vercel.app/docs/hooks/${kebabName}) — ${safeDesc}`,
      );

      console.log(`✅ [${index}] Generated ${name}`);
      index++;
    }

    fsTools.generateNavigationFile();
    readme.updateReadme(
      config.README_MAIN,
      readme.generateReadmeContent(categorizedLinks),
    );
    readme.updateReadme(
      config.README_HOOKS,
      readme.generateReadmeContent(categorizedLinks),
    );

    console.log(`\n🎉 Documentation updated successfully!`);
  } catch (error: any) {
    console.error("\n❌ Critical Error:", error.message);
    process.exit(1);
  } finally {
    fsTools.cleanup(config.TEMP_DIR);
  }
}
