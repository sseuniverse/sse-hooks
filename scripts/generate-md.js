import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const INPUT_FILE = join(process.cwd(), "generated", "typedoc", "all.json");
const BASE_OUTPUT_DIR = join(process.cwd(), "packages", "hooks", "src");

// --- Helper: Extract Comments ---
function getCommentText(comment) {
  if (!comment || !comment.summary) return "";
  return comment.summary
    .map((s) => s.text)
    .join("")
    .replace(/\n/g, " ")
    .trim();
}

// --- Helper: Resolve Types ---
function resolveType(t) {
  if (!t) return "`any`";
  if (t.type === "intrinsic") return `\`${t.name}\``;
  if (t.type === "reference") {
    const args = t.typeArguments
      ? `<${t.typeArguments.map(resolveType).join(", ")}>`
      : "";
    return `\`${t.name}${args}\``;
  }
  if (t.type === "union") return t.types.map(resolveType).join(" \\| ");
  if (t.type === "array") return `${resolveType(t.elementType)}[]`;
  if (t.type === "literal")
    return typeof t.value === "string"
      ? `\`"${t.value}"\``
      : `\`${String(t.value)}\``;
  if (t.type === "reflection" && t.declaration) {
    if (t.declaration.signatures) return "`Function`";
    return "`Object`";
  }
  if (t.type === "intersection") return t.types.map(resolveType).join(" & ");
  return "`any`";
}

function generateMarkdown() {
  try {
    const rawData = readFileSync(INPUT_FILE, "utf-8");
    const typeDocData = JSON.parse(rawData);
    const hooksMap = new Map();

    // 1. Group declarations by hook
    if (typeDocData.children) {
      typeDocData.children.forEach((module) => {
        const parts = module.name.split("/");
        if (parts.length === 0 || !parts[0]) return;

        const hookName = parts[0];
        if (!hooksMap.has(hookName)) hooksMap.set(hookName, []);

        if (module.children) {
          module.children.forEach((decl) => hooksMap.get(hookName).push(decl));
        }
      });
    }

    // 2. Generate Markdown for each hook
    hooksMap.forEach((declarations, hookName) => {
      let mdContent = `# ${hookName} Types\n\n`;

      declarations.forEach((decl) => {
        const description = getCommentText(decl.comment);

        // Handle Interfaces (Kind: 256)
        if (decl.kind === 256) {
          mdContent += `### \`${decl.name}\`\n\n`;
          if (description) mdContent += `${description}\n\n`;
          mdContent += `| Property | Type | Description |\n`;
          mdContent += `| :--- | :--- | :--- |\n`;

          if (decl.children) {
            decl.children.forEach((prop) => {
              const propName = prop.flags?.isOptional
                ? `${prop.name}?`
                : prop.name;
              const propType = resolveType(prop.type);
              const propDesc = getCommentText(prop.comment);
              mdContent += `| \`${propName}\` | ${propType} | ${propDesc || "-"} |\n`;
            });
          }
          mdContent += `\n`;
        }

        // Handle Type Aliases (Kind: 2097152)
        else if (decl.kind === 2097152) {
          mdContent += `### \`${decl.name}\`\n\n`;
          if (description) mdContent += `${description}\n\n`;
          mdContent += `**Type:** ${resolveType(decl.type)}\n\n`;
        }

        // Handle Functions / Hooks (Kind: 64)
        else if (decl.kind === 64 && decl.signatures) {
          decl.signatures.forEach((sig) => {
            mdContent += `### \`${sig.name}()\`\n\n`;
            const sigDesc = getCommentText(sig.comment);
            if (sigDesc) mdContent += `${sigDesc}\n\n`;

            if (sig.parameters && sig.parameters.length > 0) {
              mdContent += `#### Parameters\n\n`;
              mdContent += `| Parameter | Type | Description |\n`;
              mdContent += `| :--- | :--- | :--- |\n`;
              sig.parameters.forEach((param) => {
                const paramName = param.flags?.isOptional
                  ? `${param.name}?`
                  : param.name;
                const paramType = resolveType(param.type);
                const paramDesc = getCommentText(param.comment);
                mdContent += `| \`${paramName}\` | ${paramType} | ${paramDesc || "-"} |\n`;
              });
              mdContent += `\n`;
            }

            mdContent += `#### Returns\n\n`;
            mdContent += `${resolveType(sig.type)}\n\n`;
            const returnDesc = sig.comment?.returns;
            if (returnDesc) {
              const retStr = returnDesc
                .map((r) => r.text)
                .join("")
                .trim();
              mdContent += `${retStr}\n\n`;
            }
          });
        }
      });

      // 3. Write to file
      const hookDir = join(BASE_OUTPUT_DIR, hookName);
      if (!existsSync(hookDir)) {
        mkdirSync(hookDir, { recursive: true });
      }

      const filePath = join(hookDir, "types.md");
      writeFileSync(filePath, mdContent, "utf-8");
      console.log(`Generated: ${filePath}`);
    });

    console.log("\nSuccessfully generated all types.md files!");
  } catch (error) {
    console.error("Error generating markdown:", error.message);
  }
}

generateMarkdown();
