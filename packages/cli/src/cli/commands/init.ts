import inquirer from "inquirer";
import { saveConfig } from "../utils/config";
import { success } from "../utils/logger";
import { DEFAULT_CONFIG_VALUES, CLI } from "../utils/constants";
import fs from "fs-extra";
import path from "path";

export async function initCommand() {
  let isTypeScriptProject = false;
  try {
    const pkgPath = path.resolve("package.json");
    if (await fs.pathExists(pkgPath)) {
      const pkg = await fs.readJson(pkgPath);
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (allDeps.typescript) {
        isTypeScriptProject = true;
      }
    }
  } catch (err) {
    // If package.json is missing or unreadable, we stick to the hardcoded default (likely 'ts' from constants, or you can force 'js')
    // For now, we'll just fail silently and use the fallback.
  }

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "hooksDir",
      message: CLI.PROMPTS.HOOKS_DIR,
      default: DEFAULT_CONFIG_VALUES.HOOKS_DIR,
    },
    {
      type: "list",
      name: "defaultLanguage",
      message: CLI.PROMPTS.DEFAULT_LANG,
      choices: ["ts", "js"],
      default: isTypeScriptProject ? "ts" : "js",
    },
  ]);

  await saveConfig({
    hooks: {
      hooksDir: answers.hooksDir,
      defaultLanguage: answers.defaultLanguage,
      registryUrl: DEFAULT_CONFIG_VALUES.REPO_URL,
    },
  });

  success("Configuration saved!");
}
