import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { STORAGE_KEY } from "../../src/features/prototype/storage";

async function hashes(root: string, prefix = ""): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const entry of (await readdir(path.join(root, prefix), { withFileTypes: true })).sort(
    (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0),
  )) {
    const name = prefix + entry.name;
    if (entry.isDirectory()) Object.assign(result, await hashes(root, name + "/"));
    else
      result[name] = createHash("sha256")
        .update(await readFile(path.join(root, name)))
        .digest("hex");
  }
  return result;
}
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

test("prior release → new release → controlled failure → rollback preserves data and backup restore", async ({
  browser,
}, testInfo) => {
  const folder = path.resolve("artifacts/recovery-rehearsal");
  const baseline = path.join(folder, "baseline");
  const current = path.resolve("dist");
  const recorded = JSON.parse(await readFile(path.join(folder, "baseline.json"), "utf8"));
  const oldFiles = await hashes(baseline);
  expect(oldFiles).toEqual(recorded.files);
  const newFiles = await hashes(current);
  expect(digest(newFiles)).not.toBe(digest(oldFiles));
  const newIdentity = JSON.parse(await readFile(path.join(current, "release.json"), "utf8"));
  let active: string | null = baseline;
  const types: Record<string, string> = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
    ".pdf": "application/pdf",
    ".csv": "text/csv",
  };
  const server = createServer(async (request, response) => {
    response.setHeader("Cache-Control", "no-store");
    if (!active) {
      response.writeHead(503, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Kontrolowana awaria lokalnej próby");
      return;
    }
    try {
      const url = new URL(request.url || "/", "http://localhost");
      const file = path.resolve(
        active,
        "." + decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname),
      );
      if (!file.startsWith(active + path.sep)) throw new Error("Outside release");
      const data = await readFile(file);
      response.writeHead(200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
      });
      response.end(data);
    } catch {
      response.writeHead(404);
      response.end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing local origin");
  const origin = "http://127.0.0.1:" + address.port;
  const context = await browser.newContext();
  const events: string[] = [];
  try {
    let page = await context.newPage();
    await page.goto(origin + "/#/auth/sign-in");
    await page.getByRole("button", { name: "Wejdź jako Anna Kowalska", exact: true }).click();
    await page.goto(origin + "/#/app/profil");
    await page.getByLabel("Imię i nazwisko").fill("Lokalna próba odzyskania");
    await page.getByRole("button", { name: "Zapisz profil", exact: true }).click();
    const stored = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
    expect(stored).toContain("Lokalna próba odzyskania");
    await page.goto(origin + "/#/app/settings");
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Eksportuj dane", exact: true }).click();
    const exported = await readFile((await (await download).path())!, "utf8");
    expect(JSON.parse(exported)).toEqual(JSON.parse(stored!));
    events.push("Prior verified bundle loaded; edited synthetic scenario exported.");
    await page.close();
    active = current;
    page = await context.newPage();
    await page.goto(origin + "/#/app/settings");
    await expect(
      page.getByRole("button", { name: "Pobierz diagnostykę", exact: true }),
    ).toBeVisible();
    expect((await (await page.request.get(origin + "/release.json")).json()).buildId).toBe(
      newIdentity.buildId,
    );
    expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe(stored);
    events.push("New build identity verified; original browser save unchanged.");
    await page.close();
    await Promise.all(
      Array.from({ length: 5 }, async () => {
        const isolated = await browser.newContext();
        try {
          const participant = await isolated.newPage();
          await participant.goto(origin + "/#/auth/sign-in");
          await participant
            .getByRole("button", { name: "Wejdź jako Anna Kowalska", exact: true })
            .click();
          await participant.goto(origin + "/#/app/profil");
          await expect(participant.getByLabel("Imię i nazwisko")).toHaveValue("Anna Kowalska");
        } finally {
          await isolated.close();
        }
      }),
    );
    events.push("Five isolated concurrent participants loaded and used the new static build.");
    active = null;
    page = await context.newPage();
    const broken = await page.goto(origin);
    expect(broken?.status()).toBe(503);
    expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe(stored);
    events.push("Controlled HTTP 503 observed; browser save preserved.");
    await page.close();
    active = baseline;
    page = await context.newPage();
    await page.goto(origin + "/#/app/profil");
    await expect(page.getByLabel("Imię i nazwisko")).toHaveValue("Lokalna próba odzyskania");
    expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe(stored);
    events.push(
      "Prior artifact restored on the same origin; profile and full browser save retained.",
    );
    const restoration = await browser.newContext();
    try {
      const fresh = await restoration.newPage();
      await fresh.goto(origin + "/#/app/settings");
      await fresh.getByLabel("Importuj plik scenariusza").setInputFiles({
        name: "synthetic-backup.json",
        mimeType: "application/json",
        buffer: Buffer.from(exported),
      });
      await fresh.getByRole("button", { name: "Importuj", exact: true }).click();
      expect(
        await fresh.evaluate((key) => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY),
      ).toEqual(JSON.parse(exported));
      events.push(
        "Exported backup restored into a separate clean browser context and all scenario fields compared.",
      );
    } finally {
      await restoration.close();
    }
    expect(await hashes(baseline)).toEqual(recorded.files);
    const evidence = {
      checked_at: new Date().toISOString(),
      origin,
      baseline_source_version: recorded.source_version,
      baseline_artifact_sha256: digest(oldFiles),
      current_artifact_sha256: digest(newFiles),
      current_build_id: newIdentity.buildId,
      scenario_sha256: createHash("sha256").update(exported).digest("hex"),
      events,
      result: "passed",
      limitation:
        "Local static-artifact rehearsal; not a Vercel deployment, provider rollback, alert delivery or production backup verification.",
    };
    await mkdir(folder, { recursive: true });
    await writeFile(path.join(folder, "evidence.json"), JSON.stringify(evidence, null, 2) + "\n");
    await testInfo.attach("local-recovery-evidence", {
      body: JSON.stringify(evidence, null, 2),
      contentType: "application/json",
    });
  } finally {
    await context.close();
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
