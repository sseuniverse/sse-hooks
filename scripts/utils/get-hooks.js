import { path, fs } from "zx";
import { camelToKebabCase } from "./data-transform.js";

export function getHooks() {
  const jsonFilePath = path.resolve("./generated/typedoc/all.json");
  const jsonFile = fs.readFileSync(jsonFilePath, "utf-8");
  if (!jsonFile) {
    throw new Error(
      `Could not read ${jsonFilePath} file. Please run the typedoc command first.`,
    );
  }

  const parsedJson = JSON.parse(jsonFile);
  if (!parsedJson.children || !Array.isArray(parsedJson.children)) {
    return [];
  }

  return parsedJson.children
    .map((child) => {
      const modulePath = child.name;
      const name = modulePath.split("/")[0];
      const slug = camelToKebabCase(name);
      const funcGroup = child.groups?.find((g) => g.title === "Functions");

      if (
        !funcGroup ||
        !funcGroup.children ||
        funcGroup.children.length === 0
      ) {
        return null;
      }

      const hookId = funcGroup.children[0];
      const hookFunc = child.children?.find((c) => c.id === hookId);

      if (!hookFunc) {
        return null;
      }

      const typesGroup = child.groups?.find((g) => g.title === "Type Aliases");
      const types = typesGroup
        ? typesGroup.children
            .map((id) => child.children?.find((c) => c.id === id))
            .filter(Boolean)
        : [];

      const signature = hookFunc.signatures?.[0];
      const summary = (signature?.comment?.summary || [])
        .map((s) => s.text || "")
        .join("");

      return {
        id: child.id,
        name,
        modulePath,
        slug,
        path: `/hooks/${slug}`,
        summary,
        flags: hookFunc.flags,
        links: {
          doc: `/docs/${slug}`,
          github: hookFunc.sources?.[0]?.url || "",
        },
        types: types.map((item) => {
          return {
            id: item.id,
            name: item.name,
            summary: item.comment?.summary?.[0]?.text || "",
          };
        }),
      };
    })
    .filter((item) => item !== null);
}
