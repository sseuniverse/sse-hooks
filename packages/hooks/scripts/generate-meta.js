import fs from "fs";
import path from "path";
import ts from "typescript";
import prettier from "prettier";

const SRC_DIR = path.join(process.cwd(), "src");
const MANIFEST_FILE = path.join(process.cwd(), "manifest.json");
const SCHEMA_URL = "https://sse-hooks.vercel.app/api/registry/schema/hook.json";

// --- HELPERS ---

const toKebabCase = (str) => {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
};

const extractDescription = (content) => {
  const match = content.match(/\/\*\*([\s\S]*?)\*\//);
  if (!match) return "";
  return match[1]
    .split("\n")
    .map((l) => l.trim().replace(/^\*\s?/, ""))
    .filter((l) => l && !l.startsWith("@"))
    .join(" ")
    .trim();
};

const stripComments = (code) => {
  // Removes block comments and single line comments
  return code.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "$1").trim();
};

const transpileToJs = (tsCode) => {
  const result = ts.transpileModule(tsCode, {
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.React,
      removeComments: true,
    },
  });
  return result.outputText.trim();
};

const formatCode = async (content) => {
  // Formats the code using Prettier so it looks professional in the JSON
  return await prettier.format(content, {
    parser: "typescript",
    semi: true,
    singleQuote: false,
    trailingComma: "all",
    printWidth: 80,
  });
};

// --- BUNDLING LOGIC ---

const bundleHook = (
  dir,
  fileName,
  processedFiles = new Set(),
  registryDeps = new Set(),
  externalNpmDeps = new Set(),
) => {
  const filePath = path.resolve(dir, fileName);
  if (processedFiles.has(filePath) || !fs.existsSync(filePath)) return "";

  processedFiles.add(filePath);
  let content = fs.readFileSync(filePath, "utf-8");

  const importRegex =
    /^(?:import|export)\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"];?\s*$/gm;

  return content.replace(importRegex, (match, importPath) => {
    if (importPath.startsWith("../")) {
      // It's a sibling hook (Registry Dependency)
      const folderName = importPath.split("/")[1];
      const kebabName = toKebabCase(folderName);
      registryDeps.add(kebabName);

      // FIX: Do not return empty string.
      // Rewrite the import to point to the kebab-case sibling file.
      // e.g., import ... from "../UseFetch" -> import ... from "./use-fetch"
      return match.replace(importPath, `./${kebabName}`);
    } else if (importPath.startsWith("./")) {
      // It's a local utility file (Bundle it in)
      const resolvedPath = path.resolve(dir, importPath);
      const ext = [".ts", ".tsx", ".d.ts", "/index.ts", ""].find((e) =>
        fs.existsSync(resolvedPath + e),
      );

      if (ext !== undefined) {
        return bundleHook(
          dir,
          importPath + ext,
          processedFiles,
          registryDeps,
          externalNpmDeps,
        );
      }
      return match;
    } else {
      // It's an NPM dependency
      externalNpmDeps.add(importPath);
      return match;
    }
  });
};

// --- CLEANUP LOGIC ---

const cleanupMetaFiles = (hookDirectories) => {
  console.log("🧹 Cleaning up old files...");
  if (fs.existsSync(MANIFEST_FILE)) fs.unlinkSync(MANIFEST_FILE);

  hookDirectories.forEach((hookName) => {
    const individualMetaPath = path.join(SRC_DIR, hookName, "meta.json");
    if (fs.existsSync(individualMetaPath)) fs.unlinkSync(individualMetaPath);
  });
};

// --- MAIN GENERATOR ---

const generateMeta = async () => {
  const hookDirectories = fs
    .readdirSync(SRC_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  cleanupMetaFiles(hookDirectories);

  console.log("\n📦 Generating individual meta files and root manifest...");

  const hooksList = [];

  // Use for...of loop to handle async await for Prettier
  for (const hookName of hookDirectories) {
    const hookDir = path.join(SRC_DIR, hookName);
    const indexFile = path.join(hookDir, "index.ts");
    if (!fs.existsSync(indexFile)) continue;

    const registryDeps = new Set();
    const npmDeps = new Set();
    const kebabName = toKebabCase(hookName);

    const rawBundledTs = bundleHook(
      hookDir,
      "./index.ts",
      new Set(),
      registryDeps,
      npmDeps,
    );
    const description = extractDescription(rawBundledTs);

    // 1. Strip comments
    let cleanTs = stripComments(rawBundledTs)
      .replace(/export \* from .+/g, "") // Remove re-exports
      .trim();

    // 2. Format with Prettier (Makes it look great)
    try {
      cleanTs = await formatCode(cleanTs);
    } catch (error) {
      console.warn(`Warning: Could not format ${hookName}`, error);
    }

    const hookMeta = {
      $schema: SCHEMA_URL,
      name: kebabName,
      type: "registry:hook",
      title: hookName,
      description: description,
      dependencies: Array.from(npmDeps),
      registryDependencies: Array.from(registryDeps),
      file: {
        content: cleanTs,
        js: transpileToJs(cleanTs),
      },
    };

    // 3. Save individual meta.json
    const individualMetaPath = path.join(hookDir, "meta.json");
    fs.writeFileSync(individualMetaPath, JSON.stringify(hookMeta, null, 2));

    // 4. Add to manifest list
    hooksList.push({
      name: kebabName,
      description: description,
      path: `src/${hookName}/meta.json`,
    });

    console.log(`   ✨ Created: src/${hookName}/meta.json`);
  }

  // 5. Save the manifest.json
  const manifestData = {
    hooks: hooksList,
    length: hooksList.length,
  };

  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifestData, null, 2));
  console.log(`\n✅ manifest.json created with ${hooksList.length} hooks.`);
};

// --- EXECUTION ---

const args = process.argv.slice(2);

if (args.includes("--rm")) {
  const hookDirectories = fs
    .readdirSync(SRC_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  cleanupMetaFiles(hookDirectories);
} else {
  generateMeta().catch((err) => {
    console.error("Error generating meta:", err);
    process.exit(1);
  });
}
