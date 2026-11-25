#!/usr/bin/env node

import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function main() {
  const packageJson = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
  const changelog = await readFile(resolve(root, "CHANGELOG.md"), "utf8");

  if (!/^\d+\.\d+\.\d+$/.test(packageJson.version)) {
    throw new Error("package.json must contain a stable X.Y.Z version.");
  }
  if (packageJson.private !== true) {
    throw new Error("private must remain true until npm publication is explicitly approved.");
  }
  if (packageJson.license !== "MIT") throw new Error("package.json license must match LICENSE.");
  if (packageJson.engines?.node !== "^22 || ^24 || ^26") throw new Error("Node.js LTS support must be declared as ^22 || ^24 || ^26.");
  if (Object.keys(packageJson.dependencies ?? {}).length > 0 ||
      Object.keys(packageJson.devDependencies ?? {}).length > 0) {
    throw new Error("Unexpected package dependencies: review and document them before release.");
  }

  const requiredPackagePaths = [
    "src/", "examples/", "docs/", "challenges/",
    "README.md", "LICENSE", "CHANGELOG.md"
  ];
  for (const path of requiredPackagePaths) {
    if (!packageJson.files?.includes(path)) {
      throw new Error(`Package files whitelist is missing ${path}.`);
    }
  }

  const requiredFiles = [
    "src/cli.js",
    "src/lexer.js",
    "src/parser.js",
    "src/runtime.js",
    "src/format.js",
    "src/consoler.js",
    "docs/ELECTA-LANGUAGE-SPEC.md",
    "docs/CONSOLER-THREAT-MODEL.md",
    "docs/RELEASE-CHECKLIST.md",
    "README.md",
    "LICENSE"
  ];
  for (const path of requiredFiles) await access(resolve(root, path));

  if (!changelog.includes(`## [${packageJson.version}]`)) {
    throw new Error("CHANGELOG.md does not contain the current package version.");
  }

  process.stdout.write(`Release preflight passed for ${packageJson.name}@${packageJson.version}.\n`);
}

main().catch((error) => {
  process.stderr.write(`Release preflight failed: ${error.message}\n`);
  process.exitCode = 1;
});
