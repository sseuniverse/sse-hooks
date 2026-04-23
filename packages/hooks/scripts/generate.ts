import fs from "fs";
import path from "path";
import ts from "typescript";
import prettier from "prettier";
import {
  Project,
  Node,
  Type,
  Symbol,
  JSDocTag,
  FunctionDeclaration,
  ArrowFunction,
  FunctionExpression,
  SourceFile,
} from "ts-morph";

// --- CONFIGURATION ---
const SRC_DIR = path.join(process.cwd(), "src");
const MANIFEST_FILE = path.join(process.cwd(), "manifest.json");
const SCHEMA_URL = "https://sse-hooks.vercel.app/api/registry/schema/hook.json";
const TS_CONFIG_PATH = path.join(process.cwd(), "tsconfig.json");

// 🛑 STRICT BLOCKLIST: Native JS/TS types that should NEVER be deeply parsed
const NATIVE_TYPES = new Set([
  "Blob",
  "MediaStream",
  "MediaRecorder",
  "Uint8Array",
  "Float32Array",
  "AudioContext",
  "AnalyserNode",
  "Error",
  "File",
  "Date",
  "Promise",
  "ArrayBuffer",
  "ArrayBufferLike",
  "MediaStreamTrack",
  "EventTarget",
  "AudioNode",
  "Window",
  "Document",
  "HTMLElement",
  "Event",
  "URL",
  "Map",
  "Set",
  "WeakMap",
  "WeakSet",
]);

// --- TYPES ---
interface HookMeta {
  $schema?: string;
  name: string;
  type: "registry:hook";
  title: string;
  description: string;
  categories?: string[];
  dependencies: string[];
  registryDependencies: string[];
  api: {
    tags?: Record<string, string | boolean>;
    types?: any[];
    parameters: any[];
    returnType: {
      name: string;
      properties?: any[];
    };
  };
  file: {
    path: string;
    content: string;
    js: string;
  };
}

// --- HELPERS ---
const cleanupMetaFiles = (hookDirectories: string[]) => {
  console.log("🧹 Cleaning up old files...");
  if (fs.existsSync(MANIFEST_FILE)) fs.unlinkSync(MANIFEST_FILE);

  hookDirectories.forEach((hookName) => {
    const individualMetaPath = path.join(SRC_DIR, hookName, "meta.json");
    if (fs.existsSync(individualMetaPath)) fs.unlinkSync(individualMetaPath);
  });
};

const toKebabCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
};

const cleanTypeString = (typeText: string): string => {
  return typeText.replace(/import\(["'][^"']+["']\)\./g, "");
};

const extractDescription = (content: string): string => {
  const match = content.match(/\/\*\*([\s\S]*?)\*\//);
  if (!match) return "";
  return match[1]
    .split("\n")
    .map((l) => l.trim().replace(/^\*\s?/, ""))
    .filter((l) => l && !l.startsWith("@"))
    .join(" ")
    .trim();
};

const transpileToJs = (tsCode: string): string => {
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

const formatCode = async (content: string): Promise<string> => {
  return await prettier.format(content, {
    parser: "typescript",
    semi: true,
    singleQuote: false,
    trailingComma: "all",
    printWidth: 80,
  });
};

// --- AST EXTRACTION LOGIC ---

function getPropertiesFromType(baseType: Type, depth = 0): any[] | undefined {
  const type = baseType.getNonNullableType();

  // Max depth prevents infinite loops
  if (!type.isObject() || depth > 2) return undefined;

  // 🛑 Prevent parsing properties of Functions, Arrays, and Tuples
  if (type.getCallSignatures().length > 0 || type.isArray() || type.isTuple()) {
    return undefined;
  }

  // 🛑 Block native standard library objects
  const baseTypeName = cleanTypeString(type.getText()).split("<")[0].trim();
  if (NATIVE_TYPES.has(baseTypeName)) return undefined;

  const props = type.getApparentProperties();
  if (props.length === 0) return undefined;

  const results: any[] = [];

  for (const prop of props) {
    // Ignore internal TS symbols or prototypes
    if (prop.getName().startsWith("__@") || prop.getName() === "prototype")
      continue;

    const declarations = prop.getDeclarations();
    const nodeForType = prop.getValueDeclaration() || declarations[0];

    let typeText = "unknown";
    let nestedProperties = undefined;

    if (nodeForType) {
      const propType = prop.getTypeAtLocation(nodeForType);
      typeText = cleanTypeString(propType.getText());

      // Cross-Platform Path Normalization
      const filePath = nodeForType
        .getSourceFile()
        .getFilePath()
        .replace(/\\/g, "/");

      // 🛑 Stop parsing if the type comes from external libs or TS internals
      if (
        !filePath.includes("/node_modules/") &&
        !filePath.includes("/@types/") &&
        !filePath.includes("typescript/lib")
      ) {
        nestedProperties = getPropertiesFromType(propType, depth + 1);
      }
    } else {
      try {
        typeText = cleanTypeString(prop.getDeclaredType().getText());
      } catch (e) {}
    }

    results.push({
      name: prop.getName(),
      type: typeText,
      isOptional: prop.isOptional(),
      ...(nestedProperties &&
        nestedProperties.length > 0 && { properties: nestedProperties }),
    });
  }

  return results.length > 0 ? results : undefined;
}

function extractTags(tags: JSDocTag[]) {
  const extracted: Record<string, string | boolean> = {};
  for (const tag of tags) {
    const tagName = tag.getTagName();
    if (["param", "returns", "default"].includes(tagName)) continue;
    const comment = tag.getCommentText()?.trim();
    extracted[tagName] = comment ? comment : true;
  }
  return extracted;
}

/**
 * Core Logic: Analyzes original source file with full TS context to generate the "api" object
 */
function getHookApi(sourceFile: SourceFile, hookName: string) {
  const declaration = sourceFile.getExportedDeclarations().get(hookName)?.[0];

  if (!declaration) return undefined;

  let func:
    | FunctionDeclaration
    | ArrowFunction
    | FunctionExpression
    | undefined;
  if (Node.isVariableDeclaration(declaration)) {
    const init = declaration.getInitializer();
    if (Node.isArrowFunction(init) || Node.isFunctionExpression(init))
      func = init;
  } else if (Node.isFunctionDeclaration(declaration)) {
    func = declaration;
  }

  if (!func) return undefined;

  // Extract JSDoc info
  let tags = {};
  if (Node.isJSDocable(declaration)) {
    const jsdocs = declaration.getJsDocs();
    if (jsdocs.length > 0) tags = extractTags(jsdocs[0].getTags());
  }

  const parameters = func.getParameters().map((p) => {
    // Prefer the explicitly written type node string to preserve structure
    const explicitTypeText = p.getTypeNode()?.getText();
    const resolvedTypeText = p.getType().getText(p);
    const finalTypeText = explicitTypeText || resolvedTypeText;

    const props = getPropertiesFromType(p.getType());
    const isRest = p.isRestParameter();

    return {
      name: isRest ? `...${p.getName()}` : p.getName(),
      type: cleanTypeString(finalTypeText),
      isOptional: p.isOptional(),
      defaultValue: p.getInitializer()?.getText(),
      ...(props && props.length > 0 && { properties: props }),
    };
  });

  const explicitReturnTypeText = func.getReturnTypeNode()?.getText();
  const resolvedReturnTypeText = func.getReturnType().getText(func);
  const finalReturnTypeText = explicitReturnTypeText || resolvedReturnTypeText;

  const returnProps = getPropertiesFromType(func.getReturnType());

  return {
    tags,
    parameters,
    returnType: {
      name: cleanTypeString(finalReturnTypeText),
      ...(returnProps && returnProps.length > 0 && { properties: returnProps }),
    },
  };
}

// --- BUNDLING LOGIC ---

const bundleHook = (
  dir: string,
  fileName: string,
  processedFiles = new Set<string>(),
  registryDeps = new Set<string>(),
  externalNpmDeps = new Set<string>(),
): string => {
  const filePath = path.resolve(dir, fileName);
  if (processedFiles.has(filePath) || !fs.existsSync(filePath)) return "";

  processedFiles.add(filePath);
  let content = fs.readFileSync(filePath, "utf-8");

  const importRegex =
    /^(?:import|export)\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"];?\s*$/gm;

  return content.replace(importRegex, (match, importPath) => {
    if (importPath.startsWith("../")) {
      const folderName = importPath.split("/")[1];
      const kebabName = toKebabCase(folderName);
      registryDeps.add(kebabName);
      return match.replace(importPath, `./${kebabName}`);
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

// --- MAIN GENERATOR ---

const generateMeta = async () => {
  if (!fs.existsSync(SRC_DIR)) {
    console.error("❌ Error: 'src' directory not found.");
    process.exit(1);
  }

  // Initialize ts-morph with your actual project config
  const project = new Project({
    tsConfigFilePath: TS_CONFIG_PATH,
    skipAddingFilesFromTsConfig: true,
  });

  const hookDirectories = fs
    .readdirSync(SRC_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const hooksList: any[] = [];

  for (const hookName of hookDirectories) {
    const hookDir = path.join(SRC_DIR, hookName);
    const indexFile = path.join(hookDir, "index.ts");
    if (!fs.existsSync(indexFile)) continue;

    const registryDeps = new Set<string>();
    const npmDeps = new Set<string>();
    const kebabName = toKebabCase(hookName);

    // Add source file to the real project so types resolve correctly
    const sourceFile = project.addSourceFileAtPath(indexFile);

    // 1. Bundle local utilities and identify dependencies
    const rawBundledTs = bundleHook(
      hookDir,
      "./index.ts",
      new Set(),
      registryDeps,
      npmDeps,
    );

    // 2. Extract Metadata & API using the real AST with TS Config
    const description = extractDescription(rawBundledTs);
    const apiData = getHookApi(sourceFile, hookName);

    // 3. Clean and Format Source
    let cleanTs = rawBundledTs.replace(/export \* from .+/g, "").trim();
    try {
      cleanTs = await formatCode(cleanTs);
    } catch (e) {
      console.warn(`⚠️ Prettier formatting failed for ${hookName}`);
    }

    // 4. Construct Final Schema
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
        js: transpileToJs(cleanTs),
      },
    };

    const outPath = path.join(hookDir, "meta.json");
    fs.writeFileSync(outPath, JSON.stringify(hookMeta, null, 2));

    hooksList.push({
      name: kebabName,
      description,
      path: `src/${hookName}/meta.json`,
    });

    console.log(`✅ Generated: ${hookName} -> meta.json`);
  }

  // Generate Root Manifest
  fs.writeFileSync(
    MANIFEST_FILE,
    JSON.stringify({ hooks: hooksList, length: hooksList.length }, null, 2),
  );
  console.log(`\n🎉 Process complete! ${hooksList.length} hooks registered.`);
};

const args = process.argv.slice(2);

if (args.includes("--rm")) {
  const hookDirectories = fs
    .readdirSync(SRC_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  cleanupMetaFiles(hookDirectories);
  console.log("\n✅ All meta files successfully removed.");
} else {
  generateMeta().catch((err) => {
    console.error("Error generating meta:", err);
    process.exit(1);
  });
}
