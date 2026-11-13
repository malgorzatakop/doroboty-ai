import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const root = fileURLToPath(new URL(".", import.meta.url));
function sourceBuildId() {
  const hash = createHash("sha256");
  function add(name: string) {
    hash
      .update(name + "\0")
      .update(readFileSync(path.join(root, name)))
      .update("\0");
  }
  function visit(folder: string) {
    for (const entry of readdirSync(path.join(root, folder), { withFileTypes: true }).sort(
      (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0),
    )) {
      const name = folder + "/" + entry.name;
      if (entry.isDirectory()) visit(name);
      else if (entry.isFile()) add(name);
    }
  }
  for (const folder of [
    "src",
    "public",
    "docs/design-system/agent-kit/assets",
    "docs/case/baseline",
  ])
    visit(folder);
  for (const name of [
    "package.json",
    "package-lock.json",
    "tokens.css",
    "vite.config.ts",
    "tsconfig.json",
    "index.html",
    ".nvmrc",
  ])
    add(name);
  return hash.digest("hex");
}
export default defineConfig(({ command }) => {
  const buildId = command === "build" ? sourceBuildId() : "development";
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "release-identity",
        generateBundle() {
          this.emitFile({
            type: "asset",
            fileName: "release.json",
            source: JSON.stringify({ version: 1, buildId }) + "\n",
          });
        },
      },
    ],
    base: "./",
    define: { __APP_BUILD_ID__: JSON.stringify(buildId) },
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  };
});
