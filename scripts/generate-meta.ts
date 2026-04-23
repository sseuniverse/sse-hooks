import {
  Project,
  Node,
  Symbol,
  Type,
  JSDocTag,
  FunctionDeclaration,
  ArrowFunction,
  FunctionExpression,
  Directory,
} from "ts-morph";
import { writeFileSync } from "fs";
import path from "path";

// --- CONFIGURATION ---
const project = new Project({
  tsConfigFilePath: "./tsconfig.json",
});

project.addSourceFilesAtPaths("./packages/hooks/src/**/*.ts");

// --- HELPERS ---

function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function cleanTypeString(typeText: string): string {
  return typeText.replace(/import\(["'][^"']+["']\)\./g, "");
}

// 🛑 STRICT BLOCKLIST: Native browser/JS types that should NEVER be deeply parsed
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
]);

// Helper: Extract properties recursively
function getPropertiesFromType(baseType: Type, depth = 0): any[] | undefined {
  // Unwrap types like `AudioAnalysisData | null`
  const type = baseType.getNonNullableType();

  // Max depth of 2 prevents infinite loops
  if (!type.isObject() || depth > 2) return undefined;

  // Skip Functions and Arrays to prevent parsing apply, bind, push, length, etc.
  if (type.getCallSignatures().length > 0) return undefined;
  if (type.isArray()) return undefined;

  // --- THE FIX: Block native types ---
  // Extract the base type name (e.g. "Uint8Array<ArrayBuffer>" -> "Uint8Array")
  const baseTypeName = cleanTypeString(type.getText()).split("<")[0].trim();
  if (NATIVE_TYPES.has(baseTypeName)) return undefined;

  return type.getApparentProperties().map((prop: Symbol) => {
    const declarations = prop.getDeclarations();
    const nodeForType =
      prop.getValueDeclaration() ||
      (declarations.length > 0 ? declarations[0] : undefined);

    let description = "";
    let defaultValue = undefined;
    let typeText = "unknown";
    let nestedProperties = undefined;

    if (nodeForType) {
      const propType = prop.getTypeAtLocation(nodeForType);
      typeText = cleanTypeString(propType.getText());

      // --- THE FIX: Cross-Platform Path Normalization ---
      // Force all slashes to be forward slashes so the check works on Windows
      const filePath = nodeForType
        .getSourceFile()
        .getFilePath()
        .replace(/\\/g, "/");

      // Prevent recursing into node_modules, global @types, and TS standard libraries
      if (
        !filePath.includes("/node_modules/") &&
        !filePath.includes("/@types/") &&
        !filePath.includes("typescript/lib")
      ) {
        nestedProperties = getPropertiesFromType(propType, depth + 1);
      }

      if (Node.isJSDocable(nodeForType)) {
        const jsdocs = nodeForType.getJsDocs();
        if (jsdocs.length > 0) {
          description = jsdocs[0].getDescription().trim();

          const defaultTag = jsdocs[0]
            .getTags()
            .find((t) => t.getTagName() === "default");
          if (defaultTag) {
            defaultValue =
              defaultTag.getCommentText()?.trim() ||
              defaultTag.getText().replace("@default", "").trim();
          }
        }
      }
    } else {
      try {
        typeText = cleanTypeString(prop.getDeclaredType().getText());
      } catch (e) {}
    }

    return {
      name: prop.getName(),
      type: typeText,
      isOptional: prop.isOptional(),
      description,
      ...(defaultValue !== undefined && { defaultValue }),
      ...(nestedProperties &&
        nestedProperties.length > 0 && { properties: nestedProperties }),
    };
  });
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

function extractLocalTypes(dir: Directory) {
  const customTypes: any[] = [];

  for (const file of dir.getSourceFiles()) {
    for (const typeAlias of file.getTypeAliases()) {
      const typeNode = typeAlias.getTypeNode();
      let values: string[] = [];

      if (typeNode && Node.isUnionTypeNode(typeNode)) {
        values = typeNode
          .getTypeNodes()
          .map((n) => n.getText().replace(/['"]/g, ""));

        customTypes.push({
          name: typeAlias.getName(),
          description: typeAlias.getJsDocs()[0]?.getDescription().trim() || "",
          kind: "union",
          values,
        });
      } else {
        customTypes.push({
          name: typeAlias.getName(),
          description: typeAlias.getJsDocs()[0]?.getDescription().trim() || "",
          kind: "alias",
          type: cleanTypeString(typeAlias.getType().getText()),
        });
      }
    }
  }
  return customTypes;
}

// --- MAIN LOGIC ---

let generatedCount = 0;

project.getSourceFiles().forEach((sourceFile) => {
  Array.from(sourceFile.getExportedDeclarations().entries())
    .filter(([name]) => name.startsWith("use"))
    .forEach(([name, declarations]) => {
      const decl = declarations[0];

      let func:
        | FunctionDeclaration
        | ArrowFunction
        | FunctionExpression
        | undefined;

      if (Node.isVariableDeclaration(decl)) {
        const initializer = decl.getInitializer();
        if (
          Node.isArrowFunction(initializer) ||
          Node.isFunctionExpression(initializer)
        ) {
          func = initializer;
        }
      } else if (Node.isFunctionDeclaration(decl)) {
        func = decl;
      }

      if (!func) return;

      let description = "";
      let tags: Record<string, any> = {};

      if (Node.isJSDocable(decl)) {
        const jsdocs = decl.getJsDocs();
        if (jsdocs.length > 0) {
          description = jsdocs[0].getDescription().trim();
          tags = extractTags(jsdocs[0].getTags());
        }
      }

      const parameters = func.getParameters().map((p) => {
        const paramType = p.getType();
        const properties = getPropertiesFromType(paramType);

        let paramDescription = "";
        if (Node.isJSDocable(decl)) {
          const paramTag = decl
            .getJsDocs()[0]
            ?.getTags()
            .find(
              (t) =>
                t.getTagName() === "param" && t.getText().includes(p.getName()),
            );
          if (paramTag)
            paramDescription = paramTag.getCommentText()?.trim() || "";
        }

        return {
          name: p.getName(),
          type: cleanTypeString(paramType.getText()),
          isOptional: p.isOptional(),
          defaultValue: p.getInitializer()?.getText(),
          description: paramDescription,
          ...(properties && properties.length > 0 && { properties }),
        };
      });

      const returnTypeNode = func.getReturnType();
      const returnProperties = getPropertiesFromType(returnTypeNode);

      const hookDir = sourceFile.getDirectory();
      const customTypes = extractLocalTypes(hookDir);
      const rawContent = sourceFile.getFullText().trim();

      const metaJson = {
        $schema: "https://sse-hooks.vercel.app/api/registry/schema/hook.json",
        name: camelToKebab(name),
        type: "registry:hook",
        title: name,
        description: description,
        categories: tags.category ? [tags.category] : ["uncategorized"],
        dependencies: ["react"],
        registryDependencies: ["with-defaults"],
        api: {
          ...(Object.keys(tags).length > 0 && { tags }),
          ...(customTypes.length > 0 && { types: customTypes }),
          parameters,
          returnType: {
            name: cleanTypeString(returnTypeNode.getText()),
            ...(returnProperties &&
              returnProperties.length > 0 && { properties: returnProperties }),
          },
        },
        file: {
          content: rawContent,
        },
      };

      const outPath = path.join(hookDir.getPath(), "meta.json");
      writeFileSync(outPath, JSON.stringify(metaJson, null, 2));

      console.log(`✅ Generated: ${outPath.split(/packages[\/\\]/)[1]}`);
      generatedCount++;
    });
});

console.log(`\n🎉 Successfully generated ${generatedCount} meta.json files!`);
