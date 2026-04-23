export function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

export function cleanDescriptionForYaml(desc: string): string {
  return desc
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Strip markdown links
    .replace(/\n/g, " ")
    .replace(/"/g, '\\"');
}

export function getShortDescription(desc: string): string {
  return desc.split(".")[0] + ".";
}
