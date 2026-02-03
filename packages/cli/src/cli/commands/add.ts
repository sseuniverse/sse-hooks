import inquirer from "inquirer";
import { getConfig } from "../utils/config";
import { fetchHookList, downloadHook } from "../utils/git";
import { error, success, info } from "../utils/logger";
import path from "path";
import fs from "fs/promises";
import { REPO_CONFIG } from "../utils/constants";
import { HookInfo } from "@/types";
import chalk from "chalk";
import ora from "ora";
import { installNpmDependencies } from "../utils/npm";

export async function addCommand(hookNames: string[] = [], options: any = {}) {
  try {
    const config = await getConfig();
    const availableHooks = await fetchHookList(config.repoUrl);

    let finalHookNames: string[] = [...hookNames];

    // Interactive selection if no hooks provided in CLI
    if (finalHookNames.length === 0) {
      const { selectedHooks } = await inquirer.prompt([
        {
          type: "checkbox",
          name: "selectedHooks",
          message: "Select hooks to install:",
          pageSize: 10,
          choices: availableHooks.map((hook) => ({
            name: `${hook.name} - ${hook.description}`,
            value: hook.name,
          })),
          validate: (input) =>
            input.length > 0 || "You must choose at least one hook",
        },
      ]);
      finalHookNames = selectedHooks;
    }

    const language = options?.language || config?.defaultLanguage;
    const installDir = config.hooksDir;
    const installedInSession = new Set<string>();

    /**
     * Recursive function to handle hooks and their registry dependencies
     */
    async function processHook(name: string) {
      if (installedInSession.has(name)) return;

      const hookEntry = availableHooks.find((h) => h.name === name);
      if (!hookEntry) {
        error(`Hook "${name}" not found in registry.`);
        return;
      }

      const spinnerMeta = ora(
        `Checking requirements for ${chalk.bold(name)}...`,
      ).start();
      let metaData: HookInfo;

      try {
        // We need a helper or a modified downloadHook that just returns Meta without writing
        // For this logic, we assume downloadHook (or a fetchMeta) provides the requirements
        // If your downloadHook writes immediately, you might want to split that logic.
        // For now, we follow your requirement to process dependencies first:

        // This is a placeholder for getting the metadata without saving the file yet
        // In your current architecture, we'll fetch the hook info.
        metaData = await downloadHook(
          config.repoUrl,
          name,
          language,
          "",
          availableHooks,
          true,
        );
        spinnerMeta.stop();
      } catch (err: any) {
        spinnerMeta.fail(`Could not fetch metadata for ${name}`);
        return;
      }

      if (metaData.registryDependencies?.length) {
        info(`Installing internal requirements for ${chalk.cyan(name)}...`);
        for (const dep of metaData.registryDependencies) {
          await processHook(dep);
        }
      }

      if (metaData.dependencies?.length) {
        await installNpmDependencies(metaData.dependencies);
      }

      const fileName = `${REPO_CONFIG.HOOK_FILE_PREFIX}${name}.${language}`;
      const filePath = path.join(installDir, fileName);

      // Check if file exists to prevent accidental overwrites
      try {
        await fs.access(filePath);
        const { action } = await inquirer.prompt([
          {
            type: "list",
            name: "action",
            message: `Hook "${name}" already exists. Overwrite?`,
            choices: [
              { name: "Yes, replace it", value: "replace" },
              { name: "Skip", value: "skip" },
            ],
          },
        ]);
        if (action === "skip") {
          installedInSession.add(name); // Mark as processed to avoid re-prompting
          return;
        }
      } catch {}

      const downloadSpinner = ora(`Finalizing ${chalk.bold(name)}...`).start();
      try {
        await downloadHook(
          config.repoUrl,
          name,
          language,
          filePath,
          availableHooks,
        );
        installedInSession.add(name);
        downloadSpinner.succeed(chalk.green(`Hook ${name} is ready.`));
      } catch (err: any) {
        downloadSpinner.fail(
          chalk.red(`Failed to save ${name}: ${err.message}`),
        );
      }
    }

    // Start processing the initial list
    for (const name of finalHookNames) {
      await processHook(name);
    }

    if (installedInSession.size > 0) {
      console.log(""); // Spacer
      success(`Successfully processed ${installedInSession.size} hook(s).`);
    }
  } catch (err: any) {
    if (err.message === "Configuration missing") {
      error('No configuration found. Please run "sse-tool init" first.');
    } else {
      error(err instanceof Error ? err.message : "An unknown error occurred");
    }
  }
}
