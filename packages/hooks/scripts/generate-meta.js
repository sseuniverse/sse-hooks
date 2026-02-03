import fs from "fs";
import path from "path";
import ts from "typescript";

const SRC_DIR = path.join(process.cwd(), "src");
const MANIFEST_FILE = path.join(process.cwd(), "manifest.json");
const SCHEMA_URL =
  "https://raw.githubusercontent.com/sseuniverse/sse-hooks/refs/heads/main/schema/meta.json";

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
      const folderName = importPath.split("/")[1];
      registryDeps.add(toKebabCase(folderName));
      return "";
    } else if (importPath.startsWith("./")) {
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

const generateMeta = () => {
  const hookDirectories = fs
    .readdirSync(SRC_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  cleanupMetaFiles(hookDirectories);

  console.log("\n📦 Generating individual meta files and root manifest...");

  const hooksList = [];

  hookDirectories.forEach((hookName) => {
    const hookDir = path.join(SRC_DIR, hookName);
    const indexFile = path.join(hookDir, "index.ts");
    if (!fs.existsSync(indexFile)) return;

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

    const cleanTs = stripComments(rawBundledTs)
      .replace(/export \* from .+/g, "")
      .trim();

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

    // 1. Save individual meta.json in the hook directory
    const individualMetaPath = path.join(hookDir, "meta.json");
    fs.writeFileSync(individualMetaPath, JSON.stringify(hookMeta, null, 2));

    // 2. Add entry for the manifest
    hooksList.push({
      name: kebabName,
      description: description,
      path: `src/${hookName}/meta.json`,
    });

    console.log(`   ✨ Created: src/${hookName}/meta.json`);
  });

  // 3. Save the manifest.json with the requested structure
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
  generateMeta();
}
