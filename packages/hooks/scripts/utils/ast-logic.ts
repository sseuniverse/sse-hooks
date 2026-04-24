import {
  Node,
  Type,
  JSDocTag,
  SourceFile,
  FunctionDeclaration,
  ArrowFunction,
  FunctionExpression,
} from "ts-morph";
import { NATIVE_TYPES } from "./constants";
import { cleanTypeString } from "./helpers";

// Helper to prevent MDX from evaluating object types as JSX expressions
function escapeMdxType(str: string): string {
  if (str.includes("{") && str.includes("}")) {
    return `"${str.replace(/\s+/g, " ").trim()}"`;
  }
  return str;
}

export function getPropertiesFromType(
  baseType: Type,
  depth = 0,
): any[] | undefined {
  const type = baseType.getNonNullableType();
  if (!type.isObject() || depth > 2) return undefined;
  if (type.getCallSignatures().length > 0 || type.isArray() || type.isTuple())
    return undefined;

  const baseTypeName = cleanTypeString(type.getText()).split("<")[0].trim();
  if (NATIVE_TYPES.has(baseTypeName)) return undefined;

  const props = type.getApparentProperties();
  if (props.length === 0) return undefined;

  const results: any[] = [];
  for (const prop of props) {
    if (prop.getName().startsWith("__@") || prop.getName() === "prototype")
      continue;
    const declarations = prop.getDeclarations();
    const nodeForType = prop.getValueDeclaration() || declarations[0];

    let typeText = "unknown";
    let nestedProperties = undefined;
    let description = "";
    let defaultValue = undefined;

    if (nodeForType) {
      const propType = prop.getTypeAtLocation(nodeForType);
      typeText = escapeMdxType(cleanTypeString(propType.getText()));
      const filePath = nodeForType
        .getSourceFile()
        .getFilePath()
        .replace(/\\/g, "/");

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
    }
    results.push({
      name: prop.getName(),
      type: typeText,
      isOptional: prop.isOptional(),
      ...(description && { description }),
      ...(defaultValue !== undefined && { defaultValue }),
      ...(nestedProperties &&
        nestedProperties.length > 0 && { properties: nestedProperties }),
    });
  }
  return results.length > 0 ? results : undefined;
}

export function extractTags(tags: JSDocTag[]) {
  const extracted: Record<string, string | boolean> = {};
  for (const tag of tags) {
    const tagName = tag.getTagName();
    if (["param", "returns", "default"].includes(tagName)) continue;
    extracted[tagName] = tag.getCommentText()?.trim() || true;
  }
  return extracted;
}

function extractAllLocalTypes(sourceFile: SourceFile) {
  const customTypes: any[] = [];
  const filesToScan = new Set<SourceFile>();
  const scanQueue = [sourceFile];

  // Map all imported local files
  while (scanQueue.length > 0) {
    const currentFile = scanQueue.pop()!;
    if (filesToScan.has(currentFile)) continue;
    filesToScan.add(currentFile);

    for (const importDecl of currentFile.getImportDeclarations()) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      if (moduleSpecifier.startsWith("./")) {
        const importedSource = importDecl.getModuleSpecifierSourceFile();
        if (importedSource) scanQueue.push(importedSource);
      }
    }
  }

  const seenNames = new Set<string>();

  for (const file of filesToScan) {
    for (const typeAlias of file.getTypeAliases()) {
      const aliasName = typeAlias.getName();
      if (seenNames.has(aliasName)) continue;
      seenNames.add(aliasName);

      const typeNode = typeAlias.getTypeNode();
      const theType = typeAlias.getType();

      const rawText = typeNode ? typeNode.getText() : theType.getText();
      const resolvedTypeString = cleanTypeString(rawText);

      // Prevent redundant self-referencing types
      if (
        aliasName.trim() === resolvedTypeString.trim() &&
        (!typeNode || !Node.isUnionTypeNode(typeNode))
      ) {
        continue;
      }

      // Try extracting properties first to prevent empty interfaces
      const extractedProps = getPropertiesFromType(theType);

      const isObjectLike =
        theType.isObject() &&
        !theType.isArray() &&
        !theType.isTuple() &&
        theType.getCallSignatures().length === 0 &&
        extractedProps !== undefined &&
        extractedProps.length > 0;

      if (typeNode && Node.isUnionTypeNode(typeNode)) {
        customTypes.push({
          name: aliasName,
          description: typeAlias.getJsDocs()[0]?.getDescription().trim() || "",
          kind: "union",
          values: typeNode.getTypeNodes().map((n) => n.getText()), // Double quotes preserved
        });
      } else if (isObjectLike) {
        customTypes.push({
          name: aliasName,
          description: typeAlias.getJsDocs()[0]?.getDescription().trim() || "",
          kind: "interface",
          properties: extractedProps,
        });
      } else {
        customTypes.push({
          name: aliasName,
          description: typeAlias.getJsDocs()[0]?.getDescription().trim() || "",
          kind: "alias",
          type: escapeMdxType(resolvedTypeString),
        });
      }
    }

    for (const iface of file.getInterfaces()) {
      if (seenNames.has(iface.getName())) continue;
      seenNames.add(iface.getName());

      customTypes.push({
        name: iface.getName(),
        description: iface.getJsDocs()[0]?.getDescription().trim() || "",
        kind: "interface",
        properties: iface.getProperties().map((p) => ({
          name: p.getName(),
          type: escapeMdxType(cleanTypeString(p.getType().getText())),
          isOptional: p.hasQuestionToken(),
          description: p.getJsDocs()[0]?.getDescription().trim() || "",
        })),
      });
    }
  }

  return customTypes;
}

/**
 * STRICT GARBAGE COLLECTION:
 * Filters the exhaustive list of types down to ONLY the types that are
 * referenced (directly or deeply nested) but NOT expanded inline.
 */
function filterUsedTypes(allTypes: any[], parameters: any[], returnType: any) {
  const typeMap = new Map<string, any>(allTypes.map((t) => [t.name, t]));
  const usedNames = new Set<string>();
  const queue: string[] = [];

  const extractNames = (str: string) => {
    // This perfectly extracts internal references like "KeyHandler" from "Record<string, KeyHandler>"
    const matches = str.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
    for (const match of matches) {
      if (typeMap.has(match) && !usedNames.has(match)) {
        usedNames.add(match);
        queue.push(match);
      }
    }
  };

  const traverseProps = (obj: any, isRootReturnType = false) => {
    if (!obj) return;
    const hasInlineProperties =
      Array.isArray(obj.properties) && obj.properties.length > 0;

    if (!hasInlineProperties) {
      if (obj.type && typeof obj.type === "string") {
        extractNames(obj.type);
      } else if (isRootReturnType && obj.name && typeof obj.name === "string") {
        extractNames(obj.name);
      }
    }

    if (hasInlineProperties) {
      obj.properties.forEach((prop: any) => traverseProps(prop, false));
    }
  };

  parameters.forEach((p) => traverseProps(p, false));
  traverseProps(returnType, true);

  while (queue.length > 0) {
    const currentName = queue.shift()!;
    const typeDef = typeMap.get(currentName)!;

    if (typeDef.kind === "alias" && typeDef.type) {
      extractNames(typeDef.type);
    } else if (typeDef.kind === "union" && Array.isArray(typeDef.values)) {
      typeDef.values.forEach((v: string) => extractNames(v));
    } else if (
      typeDef.kind === "interface" &&
      Array.isArray(typeDef.properties)
    ) {
      typeDef.properties.forEach((p: any) => traverseProps(p, false));
    }
  }

  return Array.from(usedNames).map((name) => typeMap.get(name));
}

export function getHookApi(sourceFile: SourceFile, hookName: string) {
  const declarations = sourceFile.getExportedDeclarations().get(hookName);
  if (!declarations || declarations.length === 0) return undefined;

  let firstDecl = declarations[0];
  let jsDocNode: Node = firstDecl;

  if (Node.isVariableDeclaration(firstDecl)) {
    const stmt = firstDecl.getVariableStatement();
    if (stmt) jsDocNode = stmt;
  }

  const jsdocs = Node.isJSDocable(jsDocNode) ? jsDocNode.getJsDocs() : [];
  const jsdocTags = jsdocs.flatMap((doc) => doc.getTags());

  let tags = extractTags(jsdocTags);

  const paramDescriptions: Record<string, string> = {};
  let returnDescription = "";

  for (const tag of jsdocTags) {
    const tagName = tag.getTagName();
    if (tagName === "param" && Node.isJSDocParameterTag(tag)) {
      const paramName = tag.getName();
      const comment = tag.getCommentText()?.trim();
      if (paramName && comment) paramDescriptions[paramName] = comment;
    } else if (tagName === "returns") {
      returnDescription = tag.getCommentText()?.trim() || "";
    }
  }

  let implDecl =
    declarations.find(
      (d) =>
        (Node.isFunctionDeclaration(d) || Node.isMethodDeclaration(d)) &&
        (d as any).getBody?.() !== undefined,
    ) || firstDecl;

  let func:
    | FunctionDeclaration
    | ArrowFunction
    | FunctionExpression
    | undefined;

  if (Node.isVariableDeclaration(implDecl)) {
    const init = implDecl.getInitializer();
    if (Node.isArrowFunction(init) || Node.isFunctionExpression(init))
      func = init;
  } else if (Node.isFunctionDeclaration(implDecl)) {
    func = implDecl;
  }

  if (!func) return undefined;

  const parameters = func.getParameters().map((p) => {
    const pName = p.isRestParameter() ? `...${p.getName()}` : p.getName();
    const desc = paramDescriptions[p.getName()];
    const defVal = p.getInitializer()?.getText();
    const props = getPropertiesFromType(p.getType());

    return {
      name: pName,
      type: escapeMdxType(
        cleanTypeString(p.getTypeNode()?.getText() || p.getType().getText(p)),
      ),
      isOptional: p.isOptional(),
      ...(defVal !== undefined && { defaultValue: defVal }),
      ...(desc && { description: desc }),
      ...(props && props.length > 0 && { properties: props }),
    };
  });

  const returnProps = getPropertiesFromType(func.getReturnType());
  const returnType = {
    name: escapeMdxType(
      cleanTypeString(
        func.getReturnTypeNode()?.getText() ||
          func.getReturnType().getText(func),
      ),
    ),
    ...(returnDescription && { description: returnDescription }),
    ...(returnProps && returnProps.length > 0 && { properties: returnProps }),
  };

  const actualSourceFile = implDecl.getSourceFile();
  const allLocalTypes = extractAllLocalTypes(actualSourceFile);
  const usedTypes = filterUsedTypes(allLocalTypes, parameters, returnType);

  return {
    tags,
    types: usedTypes,
    parameters,
    returnType,
  };
}
