import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// 1. Path Setup
const __dirname = process.cwd();

const INPUT_FILE = join(__dirname, "generated", "typedoc", "all.json");
const BASE_OUTPUT_DIR = join(__dirname, "packages", "hooks", "src");
const ALL_TYPES_FILE = join(__dirname, "types-all.json");

// --- Helpers ---
function getCommentText(comment) {
  if (!comment || !comment.summary) return "";
  return comment.summary
    .map((s) => s.text)
    .join("")
    .replace(/\n/g, " ")
    .trim();
}

// 1. Returns a standard string representation of the type
function resolveType(t) {
  if (!t) return "any";
  if (t.type === "intrinsic") return t.name;
  if (t.type === "reference") {
    const args = t.typeArguments
      ? `<${t.typeArguments.map(resolveType).join(", ")}>`
      : "";
    return `${t.name}${args}`;
  }
  if (t.type === "union") return t.types.map(resolveType).join(" | ");
  if (t.type === "array") return `${resolveType(t.elementType)}[]`;
  if (t.type === "literal")
    return typeof t.value === "string" ? `"${t.value}"` : String(t.value);
  if (t.type === "reflection" && t.declaration) {
    if (t.declaration.signatures) {
      const sig = t.declaration.signatures[0];
      const params = (sig.parameters || [])
        .map((p) => `${p.name}: ${resolveType(p.type)}`)
        .join(", ");
      return `(${params}) => ${resolveType(sig.type)}`;
    }
    return "Object";
  }
  if (t.type === "tuple") return `[${t.elements.map(resolveType).join(", ")}]`;
  if (t.type === "intersection") return t.types.map(resolveType).join(" & ");
  return "any";
}

// 2. NEW: Deeply expands Type Aliases into their raw literal definitions (e.g. "a" | "b")
function expandType(t, declarations, depth = 0) {
  if (!t || depth > 3) return resolveType(t);

  // If we hit a custom reference type, look it up in the declarations
  if (t.type === "reference" && t.name) {
    const refDecl = declarations.find((d) => d.name === t.name);
    // If it's a Type Alias, it will have a `.type` property representing the underlying type
    if (refDecl && refDecl.type) {
      return expandType(refDecl.type, declarations, depth + 1);
    }
  }

  // Recursively expand nested unions, arrays, and intersections
  if (t.type === "union") {
    return t.types
      .map((typ) => expandType(typ, declarations, depth + 1))
      .join(" | ");
  }
  if (t.type === "array") {
    return `${expandType(t.elementType, declarations, depth + 1)}[]`;
  }
  if (t.type === "intersection") {
    return t.types
      .map((typ) => expandType(typ, declarations, depth + 1))
      .join(" & ");
  }

  // Fallback to normal resolution for primitives and literals
  return resolveType(t);
}

// 3. Unpacks the properties of custom Interfaces or Inline Objects
function resolveSchema(t, declarations, depth = 0) {
  if (!t || depth > 3) return undefined;

  if (t.type === "reference" && t.name) {
    const refDecl = declarations.find((d) => d.name === t.name);
    if (refDecl && refDecl.children) {
      return refDecl.children.map((child) => ({
        name: child.name,
        description: getCommentText(child.comment),
        type: resolveType(child.type),
        rawType: expandType(child.type, declarations), // ADDED EXPANSION
        required: !child.flags?.isOptional,
        schema: resolveSchema(child.type, declarations, depth + 1),
      }));
    }
  }

  if (t.type === "reflection" && t.declaration?.children) {
    return t.declaration.children.map((child) => ({
      name: child.name,
      description: getCommentText(child.comment),
      type: resolveType(child.type),
      rawType: expandType(child.type, declarations), // ADDED EXPANSION
      required: !child.flags?.isOptional,
      schema: resolveSchema(child.type, declarations, depth + 1),
    }));
  }

  if (t.type === "array") {
    return resolveSchema(t.elementType, declarations, depth + 1);
  }

  return undefined;
}

// Unpacks the return type of a hook
function extractReturnProps(retType, declarations) {
  if (!retType) return [];

  if (retType.type === "tuple") {
    return retType.elements.map((el, i) => ({
      name: `[${i}]`,
      description: "",
      type: resolveType(el),
      rawType: expandType(el, declarations),
      required: true,
      schema: resolveSchema(el, declarations),
    }));
  }

  if (retType.type === "reflection" && retType.declaration?.children) {
    return retType.declaration.children.map((child) => ({
      name: child.name,
      description: getCommentText(child.comment),
      type: resolveType(child.type),
      rawType: expandType(child.type, declarations),
      required: !child.flags?.isOptional,
      schema: resolveSchema(child.type, declarations),
    }));
  }

  if (retType.type === "reference") {
    const refDecl = declarations.find((d) => d.name === retType.name);
    if (refDecl && refDecl.children) {
      return refDecl.children.map((child) => ({
        name: child.name,
        description: getCommentText(child.comment),
        type: resolveType(child.type),
        rawType: expandType(child.type, declarations),
        required: !child.flags?.isOptional,
        schema: resolveSchema(child.type, declarations),
      }));
    }
  }

  return [
    {
      name: "return",
      description: "Hook return value",
      type: resolveType(retType),
      rawType: expandType(retType, declarations),
      required: true,
      schema: resolveSchema(retType, declarations),
    },
  ];
}

// --- Main Generator ---
function generateNuxtUiLikeTypes() {
  try {
    const rawData = readFileSync(INPUT_FILE, "utf-8");
    const typeDocData = JSON.parse(rawData);

    const allHooksMeta = [];
    const modulesMap = new Map();

    if (typeDocData.children) {
      typeDocData.children.forEach((module) => {
        const parts = module.name.split("/");
        if (parts.length === 0 || !parts[0]) return;
        const hookName = parts[0];

        if (!modulesMap.has(hookName)) modulesMap.set(hookName, []);
        if (module.children) modulesMap.get(hookName).push(...module.children);
      });
    }

    modulesMap.forEach((declarations, hookName) => {
      const hookDecl = declarations.find(
        (d) => d.kind === 64 && d.name === hookName,
      );

      let meta = {
        name: hookName,
        description: "",
        props: [],
        returns: [],
      };

      if (hookDecl && hookDecl.signatures && hookDecl.signatures.length > 0) {
        const sig = hookDecl.signatures[0];
        meta.description = getCommentText(sig.comment);

        if (sig.parameters) {
          meta.props = sig.parameters.map((p) => {
            const resolved = resolveType(p.type);
            const expanded = expandType(p.type, declarations);
            return {
              name: p.name,
              description: getCommentText(p.comment),
              type: resolved,
              // Only attach rawType if it differs from type (saves JSON bloat)
              ...(resolved !== expanded ? { rawType: expanded } : {}),
              required: !p.flags?.isOptional,
              default: p.defaultValue || "",
              schema: resolveSchema(p.type, declarations),
            };
          });
        }

        meta.returns = extractReturnProps(sig.type, declarations);

        // Clean up returns to only include rawType if it differs
        meta.returns = meta.returns.map((r) => {
          if (r.type === r.rawType) delete r.rawType;
          return r;
        });
      }

      allHooksMeta.push(meta);

      const hookDir = join(BASE_OUTPUT_DIR, hookName);
      if (!existsSync(hookDir)) mkdirSync(hookDir, { recursive: true });

      const specificFilePath = join(hookDir, "types.json");
      writeFileSync(specificFilePath, JSON.stringify(meta, null, 2), "utf-8");
      console.log(`Generated: ${specificFilePath}`);
    });

    writeFileSync(
      ALL_TYPES_FILE,
      JSON.stringify(allHooksMeta, null, 2),
      "utf-8",
    );
    console.log(`\nSuccessfully generated combined types-all.json!`);
  } catch (err) {
    console.error("Error generating UI types:", err);
  }
}

generateNuxtUiLikeTypes();
