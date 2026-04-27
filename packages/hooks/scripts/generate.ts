import fs from "fs";
import path from "path";
import { Project } from "ts-morph";
import { HookMeta } from "./utils/types";
import { getHookApi } from "./utils/ast-logic";
import {
  SRC_DIR,
  MANIFEST_FILE,
  SCHEMA_URL,
  TS_CONFIG_PATH,
} from "./utils/constants";
import {
  toKebabCase,
  extractDescription,
  formatCode,
  transpileToJs,
  cleanupMetaFiles,
} from "./utils/helpers";

const bundleHook = (
  dir: string,
  fileName: string,
  processedFiles = new Set<string>(),
  registryDeps = new Set<string>(),
  externalNpmDeps = new Set<string>(),
  collectedImports = new Set<string>(),
): string => {
  const filePath = path.resolve(dir, fileName);
  if (processedFiles.has(filePath) || !fs.existsSync(filePath)) return "";

  processedFiles.add(filePath);
  let content = fs.readFileSync(filePath, "utf-8");
  const importRegex =
    /^(?:import|export)\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"];?\s*$/gm;

  return content.replace(importRegex, (match, importPath) => {
    if (importPath.startsWith("../")) {
      const kebabName = toKebabCase(importPath.split("/")[1]);
      registryDeps.add(kebabName);
      collectedImports.add(match.replace(importPath, `./${kebabName}`).trim());
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
          collectedImports,
        );
      } else {
        collectedImports.add(match.trim());
        return "";
      }
    } else {
      externalNpmDeps.add(importPath);
      collectedImports.add(match.trim());
      return "";
    }
  });
};

const generateMeta = async () => {
  if (!fs.existsSync(SRC_DIR)) process.exit(1);

  const project = new Project({
    tsConfigFilePath: TS_CONFIG_PATH,
    skipAddingFilesFromTsConfig: true,
  });
  const hookDirectories = fs
    .readdirSync(SRC_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  cleanupMetaFiles(hookDirectories);
  const hooksList: any[] = [];

  for (const hookName of hookDirectories) {
    const hookDir = path.join(SRC_DIR, hookName);
    const indexFile = path.join(hookDir, "index.ts");
    if (!fs.existsSync(indexFile)) continue;

    const sourceFile = project.addSourceFileAtPath(indexFile);
    const registryDeps = new Set<string>();
    const npmDeps = new Set<string>();
    const collectedImports = new Set<string>();
    const kebabName = toKebabCase(hookName);

    const rawBundledTs = bundleHook(
      hookDir,
      "./index.ts",
      new Set(),
      registryDeps,
      npmDeps,
      collectedImports,
    );
    const description = extractDescription(rawBundledTs);
    const apiData = getHookApi(sourceFile, hookName);

    const importsText = Array.from(collectedImports).join("\n");
    const fullTs = `${importsText}\n\n${rawBundledTs}`;

    let cleanTs = fullTs.replace(/export \* from .+/g, "").trim();
    try {
      cleanTs = await formatCode(cleanTs, "ts");
    } catch (e) {}

    const hookMeta: HookMeta = {
      $schema: SCHEMA_URL,
      name: kebabName,
      type: "registry:hook",
      title: hookName,
      description,
      dependencies: Array.from(npmDeps),
      registryDependencies: Array.from(registryDeps),
      api: apiData || { parameters: [], returnType: { name: "void" } },
      file: {
        path: `${kebabName}.ts`,
        content: cleanTs,
        js: await formatCode(transpileToJs(cleanTs), "js"),
      },
    };

    fs.writeFileSync(
      path.join(hookDir, "meta.json"),
      JSON.stringify(hookMeta, null, 2),
    );
    hooksList.push({
      name: kebabName,
      description,
      path: `src/${hookName}/meta.json`,
    });
    console.log(`✅ Generated: ${hookName}`);
  }

  fs.writeFileSync(
    MANIFEST_FILE,
    JSON.stringify({ hooks: hooksList, length: hooksList.length }, null, 2),
  );
  console.log(`\n🎉 Done! Registered ${hooksList.length} hooks.`);
};

const args = process.argv.slice(2);
if (args.includes("--rm")) {
  cleanupMetaFiles(
    fs
      .readdirSync(SRC_DIR)
      .filter((f) => fs.lstatSync(path.join(SRC_DIR, f)).isDirectory()),
  );
} else {
  generateMeta().catch(console.error);
}
