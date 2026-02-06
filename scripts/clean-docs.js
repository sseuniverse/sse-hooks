import fs from "node:fs";

// CONFIGURATION
const OUTPUT_DIR = "./app/www/content/docs/2.hooks";

async function main() {
  console.log(`🗑️  Cleaning documentation folder: ${OUTPUT_DIR}...`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    console.log(
      `ℹ️  Directory ${OUTPUT_DIR} does not exist. Nothing to clean.`,
    );
    return;
  }

  try {
    // recursively delete the directory and its contents
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    console.log(`✅ Successfully removed directory: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error(`❌ Error deleting directory: ${error.message}`);
  }
}

main();
