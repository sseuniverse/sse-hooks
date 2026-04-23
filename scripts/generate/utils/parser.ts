import { TypeDocChild } from "../types";

export function parseComment(comment?: TypeDocChild["comment"]): string {
  if (!comment || !comment.summary) return "";
  return comment.summary
    .map((part) => part.text)
    .join("")
    .trim();
}

export function parseCategory(comment?: TypeDocChild["comment"]): string {
  if (!comment?.blockTags) return "uncategorized";
  const category = comment.blockTags.find((t) => t.tag === "@category");
  return category
    ? category.content
        .map((c) => c.text)
        .join("")
        .trim()
        .toLowerCase()
    : "uncategorized";
}

export function parseExample(comment?: TypeDocChild["comment"]): string {
  if (!comment?.blockTags) return "";
  const example = comment.blockTags.find((t) => t.tag === "@example");
  if (!example) return "";

  let content = example.content
    .map((c) => c.text)
    .join("")
    .trim();
  return content
    .replace(/^```[\w-]*\r?\n/gm, "")
    .replace(/```\s*$/gm, "")
    .trim();
}

export function parseFrontMatter(fileContent: string) {
  const match = fileContent.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { attributes: {}, body: fileContent };

  const attributes: Record<string, string> = {};
  match[1].split("\n").forEach((line) => {
    const [key, ...parts] = line.split(":");
    if (key && parts.length > 0)
      attributes[key.trim()] = parts.join(":").trim();
  });

  return { attributes, body: match[2].trim() };
}
