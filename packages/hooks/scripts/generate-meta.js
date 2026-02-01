import fs from "fs";
import path from "path";
import ts from "typescript";

const SRC_DIR = path.join(process.cwd(), "src");
const OUTPUT_FILE = path.join(process.cwd(), "meta.json");

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

/**
 * Removes all comments (JSDoc, single-line, and multi-line) from a string
 */
const stripComments = (code) => {
  // Regex covers: // comments and /* comments */
  return code.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "$1").trim();
};

const transpileToJs = (tsCode) => {
  const result = ts.transpileModule(tsCode, {
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.React,
      removeComments: true, // Native TS compiler flag to strip comments
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
      return ""; // Removed marker comment entirely
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
  console.log("🧹 Cleaning up old meta files...");
  if (fs.existsSync(OUTPUT_FILE)) fs.unlinkSync(OUTPUT_FILE);

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

  console.log("\n📦 Bundling hooks (stripping comments)...");

  const registry = hookDirectories
    .map((hookName) => {
      const hookDir = path.join(SRC_DIR, hookName);
      const indexFile = path.join(hookDir, "index.ts");
      if (!fs.existsSync(indexFile)) return null;

      const registryDeps = new Set();
      const npmDeps = new Set();

      // Bundle the raw content first to extract description
      const rawBundledTs = bundleHook(
        hookDir,
        "./index.ts",
        new Set(),
        registryDeps,
        npmDeps,
      );
      const description = extractDescription(rawBundledTs);

      // Now strip comments from the final TS output
      const cleanTs = stripComments(rawBundledTs)
        .replace(/export \* from .+/g, "")
        .trim();

      const hookMeta = {
        name: toKebabCase(hookName),
        type: "registry:hook",
        title: hookName,
        description: description,
        dependencies: Array.from(npmDeps),
        registryDependencies: Array.from(registryDeps),
        file: {
          path: `hooks/${toKebabCase(hookName)}.ts`,
          content: cleanTs,
          js: transpileToJs(cleanTs),
        },
      };

      const individualMetaPath = path.join(hookDir, "meta.json");
      fs.writeFileSync(individualMetaPath, JSON.stringify(hookMeta, null, 2));
      console.log(`   ✨ Created: src/${hookName}/meta.json`);

      return hookMeta;
    })
    .filter(Boolean);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(registry, null, 2));
  console.log(`\n✅ Global meta.json updated with ${registry.length} hooks.`);
};

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
