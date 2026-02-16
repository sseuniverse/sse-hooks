import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// 2. Configuration
const INPUT_FILE = join(process.cwd(), "generated", "typedoc", "all.json");
const BASE_OUTPUT_DIR = join(process.cwd(), "packages", "hooks", "src");

function generateSeparateTypes() {
  try {
    // 3. Read and parse the TypeDoc JSON
    const rawData = readFileSync(INPUT_FILE, "utf-8");
    const typeDocData = JSON.parse(rawData);

    const hooksMap = new Map();

    // 4. Process the top-level modules and group by hook name
    if (typeDocData.children && Array.isArray(typeDocData.children)) {
      typeDocData.children.forEach((module) => {
        // Module names are typically "useAudioRecorder/types" or "useClickAway/useClickAway"
        const parts = module.name.split("/");
        if (parts.length === 0 || !parts[0]) return;

        const hookName = parts[0];

        // Initialize the group object for this hook if it doesn't exist
        if (!hooksMap.has(hookName)) {
          hooksMap.set(hookName, {
            src: `./${hookName}`,
            declarations: [],
          });
        }

        const hookGroup = hooksMap.get(hookName);

        // Extract all declarations (Interfaces, Types, Functions, etc.)
        if (module.children && Array.isArray(module.children)) {
          module.children.forEach((decl) => {
            hookGroup.declarations.push(decl);
          });
        }
      });
    }

    // 5. Iterate over the grouped map and write to separate files
    hooksMap.forEach((hookData, hookName) => {
      // Create the target directory path: ./packages/hooks/src/{hookName}
      const hookDir = join(BASE_OUTPUT_DIR, hookName);

      // Ensure the directory exists before writing
      if (!existsSync(hookDir)) {
        mkdirSync(hookDir, { recursive: true });
      }

      // Create the target file path: ./packages/hooks/src/{hookName}/types.json
      const filePath = join(hookDir, "types.json");

      // Write the specific JSON data to the file
      writeFileSync(filePath, JSON.stringify(hookData, null, 2), "utf-8");

      console.log(`Generated: ${filePath}`);
    });

    console.log("\nSuccessfully generated all separate types.json files!");
  } catch (error) {
    console.error("Error processing types:", error.message);
  }
}

generateSeparateTypes();
