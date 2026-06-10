import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return;

  const contents = readFileSync(filePath, "utf8");

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = line.slice(0, equalsIndex).trim();
    if (!key || process.env[key] !== undefined) continue;

    let value = line.slice(equalsIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(packageRoot, "..", "..");

loadEnvFile(path.resolve(process.cwd(), ".env"));
loadEnvFile(path.resolve(packageRoot, ".env"));
loadEnvFile(path.resolve(repoRoot, ".env"));
