import { getConfig } from "../utils/config";
import { fetchHookList } from "../utils/registry";
import { info, error } from "../utils/logger";
import Table from "cli-table3";

export async function listCommand() {
  try {
    const config = await getConfig();
    const hooks = await fetchHookList(config.hooks.registryUrl);

    const table = new Table({
      head: ["Hook Name", "Description"],
      colWidths: [25, 60],
    });

    hooks.forEach((hook) => {
      table.push([hook.name, hook.description || "-"]);
    });

    console.log(table.toString());
    info(`Total hooks: ${hooks.length}`);
  } catch (err: any) {
    error(
      "Failed to list hooks: " +
        (err instanceof Error ? err.message : "Unknown error"),
    );
  }
}
