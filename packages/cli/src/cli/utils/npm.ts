import path from "path";
import fs from "fs/promises";
import { execSync } from "child_process";
import { error } from "console";
import chalk from "chalk";
import ora from "ora";

export async function installNpmDependencies(dependencies: string[] = []) {
  if (!dependencies.length) return;

  // Check existing package.json
  const pkgPath = path.join(process.cwd(), "package.json");
  let pkg;
  try {
    pkg = JSON.parse(await fs.readFile(pkgPath, "utf-8"));
  } catch {
    error("package.json not found. Skipping dependency installation.");
    return;
  }

  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  const missingDeps = dependencies.filter((dep) => !allDeps[dep]);

  if (missingDeps.length > 0) {
    const spinner = ora(
      `Installing dependencies: ${chalk.cyan(missingDeps.join(", "))}...`,
    ).start();

    try {
      // Shadcn-style: identify if using pnpm, yarn, or npm
      const agent = process.env.npm_config_user_agent || "";
      const command = agent.includes("pnpm")
        ? "pnpm add"
        : agent.includes("yarn")
          ? "yarn add"
          : "npm install";

      execSync(`${command} ${missingDeps.join(" ")}`, { stdio: "ignore" });

      spinner.succeed(chalk.green("Dependencies installed successfully."));
    } catch (err) {
      spinner.fail(chalk.red("Failed to install dependencies."));
    }
  }
}
