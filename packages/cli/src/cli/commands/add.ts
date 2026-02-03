import inquirer from "inquirer";
import { getConfig } from "../utils/config";
import { fetchHookList, downloadHook } from "../utils/git";
import { error, success, info } from "../utils/logger";
import { validateHookName } from "../utils/validation";
import path from "path";
import fs from "fs/promises";
import { REPO_CONFIG } from "../utils/constants";
import { ManifestEntry } from "@/types";

export async function addCommand(hookNames: string[] = [], options: any = {}) {
  try {
    const config = await getConfig();
    const availableHooks = await fetchHookList(config.repoUrl);

    // Get hook names if not provided
    let finalHookNames: string[] = [...hookNames];

    if (finalHookNames.length === 0) {
      const { selectedHooks } = await inquirer.prompt([
        {
          type: "checkbox",
          name: "selectedHooks",
          message:
            "Select hooks to install (use space to select, enter to confirm):",
          pageSize: 20,
          choices: availableHooks.map((hook) => ({
            name: `${hook.name} - ${hook.description}`,
            value: hook.name,
            checked: false,
          })),
          validate: (input) =>
            input.length > 0 || "You must choose at least one hook",
        },
      ]);
      finalHookNames = selectedHooks;
    }

    // Validate hook names
    const invalidNames = finalHookNames.filter(
      (name) => !validateHookName(name),
    );
    if (invalidNames.length > 0) {
      error(`Invalid hook names: ${invalidNames.join(", ")}`);
      return;
    }

    // Find hooks in manifest
    const hooksToInstall = availableHooks.filter((h) =>
      finalHookNames.includes(h.name),
    );

    const notFoundHooks = finalHookNames.filter(
      (name) => !availableHooks.some((h) => h.name === name),
    );

    if (notFoundHooks.length > 0) {
      error(
        `Hooks not found in repository, We will add it soon: ${notFoundHooks.join(", ")}`,
      );
      return;
    }

    const language = options?.language || config?.defaultLanguage;
    const installDir = config.hooksDir;
    const hooksToProcess: { hook: ManifestEntry; filePath: string }[] = [];

    for (const hook of hooksToInstall) {
      const fileName = `${REPO_CONFIG.HOOK_FILE_PREFIX}${hook.name}.${language}`;
      const filePath = path.join(installDir, fileName);

      try {
        await fs.access(filePath);
        // File exists - prompt user
        const { action } = await inquirer.prompt([
          {
            type: "list",
            name: "action",
            message: `Hook "${hook.name}" already exists at ${filePath}. What would you like to do?`,
            choices: [
              { name: "Replace with new version", value: "replace" },
              { name: "Skip this hook", value: "skip" },
              { name: "Cancel all", value: "cancel" },
            ],
          },
        ]);

        if (action === "replace") {
          hooksToProcess.push({ hook, filePath });
        } else if (action === "cancel") {
          info("Operation cancelled by user");
          return;
        }
        // If 'skip', do nothing - it won't be added to hooksToProcess
      } catch {
        // File doesn't exist - proceed with download
        hooksToProcess.push({ hook, filePath });
      }
    }

    if (hooksToProcess.length === 0) {
      info("No hooks were added (all were skipped or cancelled)");
      return;
    }

    // Download all selected hooks
    const downloadedPaths: string[] = [];

    for (const { hook, filePath } of hooksToProcess) {
      try {
        await downloadHook(
          config.repoUrl,
          hook.name,
          language,
          filePath,
          availableHooks,
        );
        downloadedPaths.push(filePath);
      } catch (err: any) {
        // Log individual download failure but continue with others
        error(`Failed to install ${hook.name}: ${err.message}`);
      }
    }

    if (downloadedPaths.length > 0) {
      success(
        `Successfully added ${downloadedPaths.length} hooks:\n${downloadedPaths.join("\n")}`,
      );
    }

    // success(
    //   `Successfully added ${downloadedPaths.length} hooks:\n${downloadedPaths.join("\n")}`,
    // );
  } catch (err: any) {
    if (err.message === "Configuration missing") {
      error('No configuration found. Please run "open-hooks init" first.');
    } else {
      error(err instanceof Error ? err.message : "An unknown error occurred");
    }
  }
}
