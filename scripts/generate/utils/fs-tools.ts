import fs from "node:fs";
import path from "node:path";
import { OUTPUT_DIR } from "../config";

export function ensureDirectory(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function generateNavigationFile(): void {
  const content = `title: Hooks\nicon: i-lucide-square-function\n`;
  fs.writeFileSync(path.join(OUTPUT_DIR, ".navigation.yml"), content);
}

export function cleanup(dir: string) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}
