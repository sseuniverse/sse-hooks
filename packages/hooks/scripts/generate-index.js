import fs from "fs";
import path from "path";

// Configuration
const HOOKS_DIR = "./src";
const INDEX_FILE = path.join(HOOKS_DIR, "index.ts");

const generateIndex = () => {
  // 1. Ensure the directory exists
  if (!fs.existsSync(HOOKS_DIR)) {
    console.log(`📁 Directory ${HOOKS_DIR} not found. Creating it...`);
    fs.mkdirSync(HOOKS_DIR, { recursive: true });
  }

  const files = fs.readdirSync(HOOKS_DIR);
  const validExports = [];
  const skippedFiles = [];

  files.forEach((file) => {
    // Ignore the index file and non-JS/TS files
    if (
      file === "index.ts" ||
      file === "index.js" ||
      !file.match(/\.(ts|tsx|js|jsx)$/)
    ) {
      return;
    }

    const filePath = path.join(HOOKS_DIR, file);
    const content = fs.readFileSync(filePath, "utf8");

    // 2. IMPORTANT CONDITION: Check for export members
    const hasExport = /\bexport\b/.test(content);

    if (hasExport) {
      const name = file.replace(/\.(ts|tsx|js|jsx)$/, "");
      validExports.push(`export * from './${name}';`);
    } else {
      skippedFiles.push(file);
    }
  });

  // 3. Generate the file content
  const header = `// This file is auto-generated. Do not edit manually.\n\n`;
  const content = header + validExports.join("\n") + "\n";

  // 4. Write the file (creates it if not present)
  fs.writeFileSync(INDEX_FILE, content);

  // --- Reporting ---
  console.log(`\n🚀 Index Generation Task`);
  console.log(`📂 Path: ${INDEX_FILE}`);
  console.log(`✅ Included: ${validExports.length} files.`);

  if (skippedFiles.length > 0) {
    console.warn(
      `\n⚠️  The following files were SKIPPED (no export members found):`,
    );
    skippedFiles.forEach((file) => console.warn(`   - ${file}`));
  }
};

generateIndex();
