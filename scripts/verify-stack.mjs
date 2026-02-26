import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const packageJsonPath = path.join(rootDir, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

const dependencies = packageJson.dependencies ?? {};
const devDependencies = packageJson.devDependencies ?? {};
const scripts = packageJson.scripts ?? {};

const requiredPackages = [
  "react",
  "react-dom",
  "typescript",
  "eslint",
  "vite",
  "husky",
  "lint-staged",
  "zustand",
  "zod",
  "i18next",
  "react-i18next"
];

const requiredScripts = [
  "lint",
  "typecheck",
  "test:run",
  "build",
  "precommit",
  "precommit:check",
  "ci:check"
];

const requiredFiles = [
  "vite.config.ts",
  "src/main.tsx",
  "src/store/useOrderStore.ts",
  "src/validation/orderSchema.ts",
  "src/i18n/config.ts",
  ".husky/pre-commit"
];

const errors = [];

for (const pkg of requiredPackages) {
  if (!dependencies[pkg] && !devDependencies[pkg]) {
    errors.push(`Missing required package: ${pkg}`);
  }
}

for (const script of requiredScripts) {
  if (!scripts[script]) {
    errors.push(`Missing required npm script: ${script}`);
  }
}

if (!scripts.precommit?.includes("lint-staged")) {
  errors.push("`precommit` script should include lint-staged.");
}

for (const relativeFile of requiredFiles) {
  if (!fs.existsSync(path.join(rootDir, relativeFile))) {
    errors.push(`Missing required file: ${relativeFile}`);
  }
}

if (errors.length > 0) {
  console.error("Stack validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Stack validation passed.");
