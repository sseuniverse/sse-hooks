import fs from "node:fs";
import { CATEGORY_MAP } from "../config";

export function generateReadmeContent(
  categorizedLinks: Record<string, string[]>,
): string {
  let output = "";
  for (const [key, title] of Object.entries(CATEGORY_MAP)) {
    const links = categorizedLinks[key];
    if (links && links.length > 0) {
      output += `### ${title}\n${links.join("\n")}\n\n`;
    }
  }
  return output.trim();
}

export function updateReadme(filePath: string, newContent: string): void {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf-8");
  const startMarker = "<!-- HOOKS:START -->";
  const endMarker = "<!-- HOOKS:END -->";


  const regex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);
  const replacement = `${startMarker}\n\n${newContent}\n${endMarker}`;

  if (content.match(regex)) {
    fs.writeFileSync(filePath, content.replace(regex, replacement));
    console.log(`📄 Updated ${filePath}`);
  }
}
