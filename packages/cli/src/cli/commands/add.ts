import inquirer from "inquirer";
import { getConfig } from "../utils/config";
import { fetchHookList, downloadHook } from "../utils/registry";
import { error, success, info } from "../utils/logger";
import path from "path";
import fs from "fs-extra";
import { HookInfo } from "@/types";
import chalk from "chalk";
import ora from "ora";
import { installNpmDependencies } from "../utils/npm";

export async function addCommand(hookNames: string[] = [], options: any = {}) {
  try {
    const config = await getConfig();
    const installDir = config.hooks.hooksDir;
    const language = options?.language || config?.hooks.defaultLanguage;

    let initialQueue: string[] = [...hookNames];

    if (initialQueue.length === 0) {
      const availableHooks = await fetchHookList(config.hooks.registryUrl);
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
      initialQueue = selectedHooks;
    }

    const hooksToInstall = new Set<string>();
    const dependenciesToInstall = new Set<string>();
    const payloadMap = new Map<string, HookInfo>();

    const resolveSpinner = ora("Resolving hooks...").start();

    try {
      const queue = [...initialQueue];

      while (queue.length > 0) {
        const currentInput = queue.shift()!;
        if (
          !currentInput.startsWith("http") &&
          hooksToInstall.has(currentInput)
        ) {
          continue;
        }

        // Fetch metadata (supports both Name and URL)
        const meta = await downloadHook(
          config.hooks.registryUrl,
          currentInput,
          language,
          "",
          true,
        );

        const realName = meta.name;
        if (hooksToInstall.has(realName)) continue;
        hooksToInstall.add(realName);
        payloadMap.set(realName, meta);

        if (meta.registryDependencies) {
          queue.push(...meta.registryDependencies);
        }

        if (meta.dependencies) {
          meta.dependencies.forEach((dep) => dependenciesToInstall.add(dep));
        }
      }

      resolveSpinner.stop();
    } catch (err: any) {
      resolveSpinner.fail("Failed to resolve hooks.");
      error(err instanceof Error ? err.message : "Unknown error");
      return;
    }

    const sortedHooks = Array.from(hooksToInstall).sort();
    const sortedDeps = Array.from(dependenciesToInstall).sort();

    if (sortedHooks.length) {
      console.log(chalk.bold.cyan(`\nHooks:`));
      sortedHooks.forEach((h) => console.log(`- ${h}`));
    }

    if (sortedDeps.length) {
      console.log(chalk.bold.cyan(`\nDependencies:`));
      sortedDeps.forEach((d) => console.log(`- ${d}`));
    }

    console.log("");

    const { proceed } = await inquirer.prompt([
      {
        type: "confirm",
        name: "proceed",
        message: "Ready to install. Proceed?",
        default: true,
      },
    ]);

    if (!proceed) {
      info("Operation cancelled.");
      return;
    }

    if (sortedDeps.length) {
      await installNpmDependencies(sortedDeps);
    }

    const writeSpinner = ora("Writing components...").start();

    for (const name of sortedHooks) {
      const meta = payloadMap.get(name)!;
      const code = language === "js" ? meta.file.js : meta.file.content;

      // Use the name from metadata for the file name
      const fileName = `${meta.name}.${language}`;
      const filePath = path.join(installDir, fileName);

      try {
        await fs.access(filePath);
      } catch {}

      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, code);
    }

    writeSpinner.succeed(chalk.green("Done."));

    if (hooksToInstall.size > 0) {
      success(
        `Installed ${hooksToInstall.size} component(s) to ${chalk.cyan(
          installDir,
        )}`,
      );
    }
  } catch (err: any) {
    if (err.message === "Configuration missing") {
      error('No configuration found. Please run "sse-tool init" first.');
    } else {
      error(err instanceof Error ? err.message : "An unknown error occurred");
    }
  }
}
