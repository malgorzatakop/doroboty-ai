import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { STORAGE_KEY } from "../../src/features/prototype/storage";

test("diagnostics records global failures without messages, URLs or scenario data", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/#/app/settings");
  await page.evaluate(() => {
    window.dispatchEvent(new ErrorEvent("error", { message: "private-runtime-text" }));
    window.dispatchEvent(
      new PromiseRejectionEvent("unhandledrejection", {
        promise: Promise.resolve(),
        reason: "private-rejection-token",
      }),
    );
  });
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Pobierz diagnostykę", exact: true }).click();
  const text = await readFile((await (await downloaded).path())!, "utf8");
  const report = JSON.parse(text);
  expect(report.buildId).toMatch(/^[a-f0-9]{64}$/);
  expect(report.events.map((event: { code: string }) => event.code)).toEqual([
    "runtime-error",
    "unhandled-rejection",
  ]);
  expect(text).not.toMatch(
    /private-runtime-text|private-rejection-token|http|candidate|people|stack/,
  );
  expect(requests.every((url) => url.startsWith("http://127.0.0.1:3106/"))).toBe(true);
  const release = await page.request.get("/release.json");
  expect((await release.json()).buildId).toBe(report.buildId);
});

test("render failure preserves unsaved scenario export and provides keyboard recovery", async ({
  page,
}) => {
  await page.goto("/#/auth/sign-in");
  await page.getByRole("button", { name: "Wejdź jako Anna Kowalska", exact: true }).click();
  await page.goto("/#/app/profil");
  const original = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error("private-storage-text");
    };
  });
  await page.getByLabel("Imię i nazwisko").fill("Lokalna kopia do odzyskania");
  await page.getByRole("button", { name: "Zapisz profil", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Wyeksportuj" })).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(Intl, "NumberFormat", {
      value: class {
        constructor() {
          throw new Error("private-render-text");
        }
      },
    });
  });
  await page.getByRole("link", { name: "Wszystkie oferty", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Nie udało się wyświetlić prototypu" }),
  ).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe(original);
  const download = page.waitForEvent("download");
  const exportButton = page.getByRole("button", {
    name: "Eksportuj dane z tej karty",
    exact: true,
  });
  await exportButton.focus();
  await page.keyboard.press("Enter");
  expect(await readFile((await (await download).path())!, "utf8")).toContain(
    "Lokalna kopia do odzyskania",
  );
  const diagnostic = page.waitForEvent("download");
  await page.getByRole("button", { name: "Pobierz diagnostykę", exact: true }).click();
  const text = await readFile((await (await diagnostic).path())!, "utf8");
  expect(text).toContain("render-error");
  expect(text).toContain("storage-write-failed");
  expect(text).not.toMatch(/private-storage-text|private-render-text|Lokalna kopia do odzyskania/);
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(exportButton).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "artifacts/predeployment-recovery-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Odśwież prototyp", exact: true }).click();
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.getByRole("button", { name: "Pobierz diagnostykę", exact: true })).toHaveCount(
    0,
  );
  expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe(original);
});
