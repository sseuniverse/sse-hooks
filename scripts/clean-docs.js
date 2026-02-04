import fs from "node:fs";
import path from "node:path";

// CONFIGURATION
const OUTPUT_DIR = "./app/www/content/2.hooks";

async function main() {
  console.log("🗑️  Cleaning documentation folder...");

  if (!fs.existsSync(OUTPUT_DIR)) {
    console.log(
      `ℹ️  Directory ${OUTPUT_DIR} does not exist. Nothing to clean.`,
    );
    return;
  }

  const files = fs.readdirSync(OUTPUT_DIR);
  let deletedCount = 0;

  for (const file of files) {
    // Only delete markdown files to be safe
    if (file.endsWith(".md")) {
      const filePath = path.join(OUTPUT_DIR, file);
      fs.unlinkSync(filePath);
      deletedCount++;
    }
  }

  console.log(`✅ Removed ${deletedCount} markdown files from ${OUTPUT_DIR}`);
}

main();
