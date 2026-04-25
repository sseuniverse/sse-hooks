import ts from "typescript";
import prettier from "prettier";
import fs from "fs";
import { MANIFEST_FILE, SRC_DIR } from "./constants";
import path from "path";

export const toKebabCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
};

export const cleanTypeString = (typeText: string): string => {
  return typeText.replace(/import\(["'][^"']+["']\)\./g, "");
};

export const extractDescription = (content: string): string => {
  const match = content.match(/\/\*\*([\s\S]*?)\*\//);
  if (!match) return "";
  return match[1]
    .split("\n")
    .map((l) => l.trim().replace(/^\*\s?/, ""))
    .filter((l) => l && !l.startsWith("@"))
    .join(" ")
    .trim();
};

export const transpileToJs = (tsCode: string): string => {
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

export const formatCode = async (
  content: string,
  lang: "ts" | "js" = "ts",
): Promise<string> => {
  const parser = lang === "ts" ? "typescript" : "babel";
  return await prettier.format(content, {
    parser,
    semi: true,
    singleQuote: false,
    trailingComma: "all",
    printWidth: 80,
  });
};

export const cleanupMetaFiles = (hookDirectories: string[]) => {
  console.log("🧹 Cleaning up old files...");
  if (fs.existsSync(MANIFEST_FILE)) fs.unlinkSync(MANIFEST_FILE);

  hookDirectories.forEach((hookName) => {
    const individualMetaPath = path.join(SRC_DIR, hookName, "meta.json");
    if (fs.existsSync(individualMetaPath)) fs.unlinkSync(individualMetaPath);
  });
};
