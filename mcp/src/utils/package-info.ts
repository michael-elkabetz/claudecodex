import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface PackageInfo {
  name: string;
  version: string;
}

export function getPackageInfo(): PackageInfo {
  const packageJson = JSON.parse(
    readFileSync(join(__dirname, "..", "..", "package.json"), "utf-8"),
  );

  return {
    name: packageJson.name,
    version: packageJson.version,
  };
}
