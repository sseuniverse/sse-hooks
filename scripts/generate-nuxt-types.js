import fs, {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
} from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

// 1. Path Setup
const __dirname = process.cwd();

const TEMP_DIR = "./generated";
const INPUT_FILE = join(__dirname, "generated", "typedoc", "all.json");
const BASE_OUTPUT_DIR = join(__dirname, "packages", "hooks", "src");

// --- Helpers ---
function getCommentText(comment) {
  if (!comment || !comment.summary) return "";
  return comment.summary
    .map((s) => s.text)
    .join("")
    .replace(/\n/g, " ")
    .trim();
}

// [NEW] Added usedTypes Set to track references
function resolveType(t, usedTypes) {
  if (!t) return "any";
  if (t.type === "intrinsic") return t.name;
  if (t.type === "reference") {
    // [NEW] Register the type name as "used"
    if (usedTypes && t.name) usedTypes.add(t.name);

    const args = t.typeArguments
      ? `<${t.typeArguments.map((a) => resolveType(a, usedTypes)).join(", ")}>`
      : "";
    return `${t.name}${args}`;
  }
  if (t.type === "union")
    return t.types.map((a) => resolveType(a, usedTypes)).join(" | ");
  if (t.type === "array") return `${resolveType(t.elementType, usedTypes)}[]`;
  if (t.type === "literal")
    return typeof t.value === "string" ? `"${t.value}"` : String(t.value);
  if (t.type === "reflection" && t.declaration) {
    if (t.declaration.signatures) {
      const sig = t.declaration.signatures[0];
      const params = (sig.parameters || [])
        .map((p) => `${p.name}: ${resolveType(p.type, usedTypes)}`)
        .join(", ");
      return `(${params}) => ${resolveType(sig.type, usedTypes)}`;
    }
    return "Object";
  }
  if (t.type === "tuple")
    return `[${t.elements.map((a) => resolveType(a, usedTypes)).join(", ")}]`;
  if (t.type === "intersection")
    return t.types.map((a) => resolveType(a, usedTypes)).join(" & ");
  return "any";
}

// [NEW] Passed usedTypes down the recursive chain
function expandType(t, declarations, depth = 0, usedTypes) {
  if (!t || depth > 3) return resolveType(t, usedTypes);

  if (t.type === "reference" && t.name) {
    if (usedTypes) usedTypes.add(t.name); // Track reference
    const refDecl = declarations.find((d) => d.name === t.name);
    if (refDecl && refDecl.type) {
      return expandType(refDecl.type, declarations, depth + 1, usedTypes);
    }
  }

  if (t.type === "union") {
    return t.types
      .map((typ) => expandType(typ, declarations, depth + 1, usedTypes))
      .join(" | ");
  }
  if (t.type === "array") {
    return `${expandType(t.elementType, declarations, depth + 1, usedTypes)}[]`;
  }
  if (t.type === "intersection") {
    return t.types
      .map((typ) => expandType(typ, declarations, depth + 1, usedTypes))
      .join(" & ");
  }

  return resolveType(t, usedTypes);
}

// [NEW] Passed usedTypes down the recursive chain
function resolveSchema(t, declarations, depth = 0, usedTypes) {
  if (!t || depth > 3) return undefined;

  if (t.type === "reference" && t.name) {
    if (usedTypes) usedTypes.add(t.name); // Track reference
    const refDecl = declarations.find((d) => d.name === t.name);
    if (refDecl && refDecl.children) {
      return refDecl.children.map((child) => ({
        name: child.name,
        description: getCommentText(child.comment),
        type: resolveType(child.type, usedTypes),
        rawType: expandType(child.type, declarations, 0, usedTypes),
        required: !child.flags?.isOptional,
        schema: resolveSchema(child.type, declarations, depth + 1, usedTypes),
      }));
    }
  }

  if (t.type === "reflection" && t.declaration?.children) {
    return t.declaration.children.map((child) => ({
      name: child.name,
      description: getCommentText(child.comment),
      type: resolveType(child.type, usedTypes),
      rawType: expandType(child.type, declarations, 0, usedTypes),
      required: !child.flags?.isOptional,
      schema: resolveSchema(child.type, declarations, depth + 1, usedTypes),
    }));
  }

  if (t.type === "array") {
    return resolveSchema(t.elementType, declarations, depth + 1, usedTypes);
  }

  return undefined;
}

// [NEW] Passed usedTypes to extractReturnProps
function extractReturnProps(retType, declarations, usedTypes) {
  if (!retType) return [];

  if (retType.type === "tuple") {
    return retType.elements.map((el, i) => ({
      name: `[${i}]`,
      description: "",
      type: resolveType(el, usedTypes),
      rawType: expandType(el, declarations, 0, usedTypes),
      required: true,
      schema: resolveSchema(el, declarations, 0, usedTypes),
    }));
  }

  if (retType.type === "reflection" && retType.declaration?.children) {
    return retType.declaration.children.map((child) => ({
      name: child.name,
      description: getCommentText(child.comment),
      type: resolveType(child.type, usedTypes),
      rawType: expandType(child.type, declarations, 0, usedTypes),
      required: !child.flags?.isOptional,
      schema: resolveSchema(child.type, declarations, 0, usedTypes),
    }));
  }

  if (retType.type === "reference") {
    if (usedTypes && retType.name) usedTypes.add(retType.name); // Track return reference
    const refDecl = declarations.find((d) => d.name === retType.name);
    if (refDecl && refDecl.children) {
      return refDecl.children.map((child) => ({
        name: child.name,
        description: getCommentText(child.comment),
        type: resolveType(child.type, usedTypes),
        rawType: expandType(child.type, declarations, 0, usedTypes),
        required: !child.flags?.isOptional,
        schema: resolveSchema(child.type, declarations, 0, usedTypes),
      }));
    }
  }

  return [
    {
      name: "return",
      description: "Hook return value",
      type: resolveType(retType, usedTypes),
      rawType: expandType(retType, declarations, 0, usedTypes),
      required: true,
      schema: resolveSchema(retType, declarations, 0, usedTypes),
    },
  ];
}

// --- Main Generator ---
function generateNuxtUiLikeTypes() {
  try {
    execSync("npx typedoc", { stdio: "inherit" });

    const rawData = readFileSync(INPUT_FILE, "utf-8");
    const typeDocData = JSON.parse(rawData);

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

      // [NEW] Initialize a Set to track what types this hook consumes
      const usedTypes = new Set();

      let meta = {
        name: hookName,
        description: "",
        props: [],
        returns: [],
        types: [],
      };

      // 1. Process Props and Returns FIRST (this populates usedTypes)
      if (hookDecl && hookDecl.signatures && hookDecl.signatures.length > 0) {
        const sig = hookDecl.signatures[0];
        meta.description = getCommentText(sig.comment);

        if (sig.parameters) {
          meta.props = sig.parameters.map((p) => {
            const resolved = resolveType(p.type, usedTypes);
            const expanded = expandType(p.type, declarations, 0, usedTypes);
            return {
              name: p.name,
              description: getCommentText(p.comment),
              type: resolved,
              ...(resolved !== expanded ? { rawType: expanded } : {}),
              required: !p.flags?.isOptional,
              default: p.defaultValue || "",
              schema: resolveSchema(p.type, declarations, 0, usedTypes),
            };
          });
        }

        meta.returns = extractReturnProps(sig.type, declarations, usedTypes);

        meta.returns = meta.returns.map((r) => {
          if (r.type === r.rawType) delete r.rawType;
          return r;
        });
      }

      // 2. NOW Extract Standalone Declarations
      declarations.forEach((d) => {
        // Skip the main hook function
        if (d.name === hookName && d.kind === 64) return;

        const isTypeUsed = usedTypes.has(d.name);

        /**
         * Identify redundant interfaces that are already explained in props/returns.
         * - UseAudioRecorderOptions is already in 'props[0].schema'
         * - UseAudioRecorderReturn is already in the 'returns' array
         */
        const isOptionsInterface =
          d.name === `${hookName[0].toUpperCase()}${hookName.slice(1)}Options`;
        const isReturnInterface =
          d.name === `${hookName[0].toUpperCase()}${hookName.slice(1)}Return`;

        // We only want complex structures like 'AudioAnalysisData' that aren't the main Input/Output interfaces
        const isComplexType =
          (d.kind === 256 || d.kind === 8) &&
          !isOptionsInterface &&
          !isReturnInterface;

        /**
         * Logic:
         * 1. If it's a simple used type (like AudioMimeType), skip it (it's already inlined as a union string).
         * 2. If it's an unused type, skip it to keep the JSON clean.
         * 3. Only proceed if it's a "Complex Type" (Interface/Enum) that isn't redundant.
         */
        if (isTypeUsed && !isComplexType) return;
        if (!isTypeUsed) return;

        // --- Process Interfaces (e.g., AudioAnalysisData) ---
        if (d.kind === 256) {
          meta.types.push({
            kind: "interface",
            name: d.name,
            description: getCommentText(d.comment),
            properties: (d.children || []).map((child) => ({
              name: child.name,
              description: getCommentText(child.comment),
              type: resolveType(child.type),
              rawType: expandType(child.type, declarations),
              required: !child.flags?.isOptional,
              schema: resolveSchema(child.type, declarations),
            })),
          });
        }

        // --- Process Type Aliases ---
        if (d.kind === 4194304) {
          const resolved = resolveType(d.type);
          const expanded = expandType(d.type, declarations);
          meta.types.push({
            kind: "type",
            name: d.name,
            description: getCommentText(d.comment),
            type: resolved,
            ...(resolved !== expanded ? { rawType: expanded } : {}),
            schema: resolveSchema(d.type, declarations),
          });
        }

        // --- Process Enums ---
        if (d.kind === 8) {
          meta.types.push({
            kind: "enum",
            name: d.name,
            description: getCommentText(d.comment),
            members: (d.children || []).map((child) => {
              const val =
                child.type && child.type.value !== undefined
                  ? child.type.value
                  : child.defaultValue !== undefined
                    ? child.defaultValue
                    : child.name;

              return {
                name: child.name,
                description: getCommentText(child.comment),
                value: val,
              };
            }),
          });
        }
      });

      const hookDir = join(BASE_OUTPUT_DIR, hookName);
      if (!existsSync(hookDir)) mkdirSync(hookDir, { recursive: true });

      const specificFilePath = join(hookDir, "types.json");
      writeFileSync(specificFilePath, JSON.stringify(meta, null, 2), "utf-8");
      console.log(`Generated: ${specificFilePath}`);
    });
  } catch (err) {
    console.error("Error generating UI types:", err);
  } finally {
    if (fs.existsSync(TEMP_DIR)) {
      console.log(`🧹 Cleaning up temporary folder: ${TEMP_DIR}`);
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
  }
}

generateNuxtUiLikeTypes();
