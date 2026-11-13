import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Anna can load the example in a fresh browser without replacing her own answers", async ({
  page,
}) => {
  await page.goto("/#/auth/sign-in");
  await page.getByRole("button", { name: "Wejdź jako Anna Kowalska", exact: true }).click();
  await page.goto("/#/app/profil/karta");
  const load = page.getByRole("button", { name: "Wczytaj przykładową kartę", exact: true });
  await expect(load).toBeVisible();
  await page
    .getByLabel("Projekt lub produkt z wykorzystaniem AI", { exact: true })
    .fill("Moja własna odpowiedź");
  await expect(load).toHaveCount(0);
  await page.getByLabel("Projekt lub produkt z wykorzystaniem AI", { exact: true }).fill("");
  await load.click();
  await expect(page.getByRole("button", { name: "Wróć do edycji", exact: true })).toBeVisible();
  await expect(
    page.getByText(/Jako Product Managerka przygotowałam próbę wykorzystania ChatGPT/),
  ).toBeVisible();
  await expect(page.getByText(/Fragment przygotowanej przeze mnie instrukcji/)).toBeVisible();
  await page.reload();
  await expect(
    page.getByLabel("Projekt lub produkt z wykorzystaniem AI", { exact: true }),
  ).toHaveValue(/ChatGPT/);
  await expect(load).toHaveCount(0);
  await page.goto("/#/auth/sign-in");
  await page.getByRole("button", { name: "Wejdź jako Marek Nowak", exact: true }).click();
  await page.goto("/#/app/profil/karta");
  await expect(load).toHaveCount(0);
});

test("answer counters retain long drafts and explain the completion limit", async ({ page }) => {
  await page.goto("/#/auth/sign-in");
  await page.getByRole("button", { name: "Wejdź jako Anna Kowalska", exact: true }).click();
  await page.goto("/#/app/profil/karta");
  const project = page.getByLabel("Projekt lub produkt z wykorzystaniem AI", { exact: true });
  await expect(page.getByText("Maksymalnie 1000 znaków", { exact: true })).toHaveCount(5);
  await project.fill("a".repeat(1001));
  await expect(page.locator("#card-project-count")).toContainText("1001 / 1000");
  await expect(project).toHaveValue("a".repeat(1001));
  await page.getByRole("button", { name: "Zapisz szkic karty", exact: true }).click();
  await page.reload();
  await expect(project).toHaveValue("a".repeat(1001));
  await page.getByLabel("Etap projektu", { exact: true }).selectOption("trial");
  await page
    .getByLabel("Twój wkład i efekt pracy", { exact: true })
    .fill("Przygotowałam instrukcję i sprawdziłam przykłady. Efekt nie został jeszcze zmierzony.");
  await page
    .getByLabel("Jak korzystasz z narzędzi AI w pracy", { exact: true })
    .fill("AI proponuje szkic, a ja sprawdzam zgodność z zasadami.");
  await page.getByRole("button", { name: "Zapisz kartę", exact: true }).click();
  await expect(project).toBeFocused();
  await expect(page.locator("#card-project-error")).toContainText("Skróć odpowiedź do 1000 znaków");
  await project.fill("Opis projektu i zastosowania AI.");
  await expect(page.locator("#card-project-count")).toContainText("32 / 1000");
  await page.setViewportSize({ width: 390, height: 900 });
  await page
    .locator(".experience-question")
    .first()
    .screenshot({ path: "artifacts/candidate-card-counts/project-counter.png" });
  await page.locator(".experience-optional > button").focus();
  await page
    .locator(".experience-optional")
    .evaluate((element) => element.scrollIntoView({ block: "start", behavior: "instant" }));
  await page.screenshot({ path: "artifacts/candidate-card-counts/optional-section.png" });
});

test("card drafts, optional questions, application inclusion and immutable employer copy", async ({
  page,
}) => {
  await page.goto("/#/auth/sign-in");
  await page.getByRole("button", { name: "Wejdź jako Anna Kowalska", exact: true }).click();
  await page.goto("/#/app/profil");
  await page.getByRole("link", { name: "Utwórz kartę", exact: true }).click();
  await page.getByRole("button", { name: "Zapisz kartę", exact: true }).click();
  await expect(
    page.getByLabel("Projekt lub produkt z wykorzystaniem AI", { exact: true }),
  ).toBeFocused();
  await page
    .getByLabel("Projekt lub produkt z wykorzystaniem AI", { exact: true })
    .fill("Pomoc w odpowiedziach na reklamacje. AI przygotowuje szkice dla konsultantów.");
  await page.getByRole("button", { name: "Zapisz szkic karty", exact: true }).click();
  await page.reload();
  await expect(
    page.getByLabel("Projekt lub produkt z wykorzystaniem AI", { exact: true }),
  ).toHaveValue(/reklamacje/);
  await page.getByLabel("Etap projektu", { exact: true }).selectOption("trial");
  await page
    .getByLabel("Twój wkład i efekt pracy", { exact: true })
    .fill(
      "Uporządkowałam typy reklamacji i sprawdziłam 20 szkiców. Prawniczka sprawdziła zasady. Nie mierzyliśmy jeszcze oszczędności czasu.",
    );
  await page
    .getByLabel("Jak korzystasz z narzędzi AI w pracy", { exact: true })
    .fill("ChatGPT tworzy szkic. Sama dobieram informacje i sprawdzam zgodność z zasadami.");
  await expect(page.getByLabel("Trudność i wyciągnięta lekcja", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Zapisz kartę", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "gotowa do dołączenia" })).toBeVisible();
  await page.getByRole("button", { name: "Podgląd karty", exact: true }).click();
  await expect(page.getByText("Etap: Próba", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Trudność i wyciągnięta lekcja", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Wróć do edycji", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Chcesz dodać coś więcej? Opcjonalnie", exact: true }),
  ).toHaveAttribute("aria-expanded", "true");
  await page
    .getByLabel("Trudność i wyciągnięta lekcja", { exact: true })
    .fill("Dodałam kontrolę obietnic zwrotu. Nauczyłam się sprawdzać zasady, nie tylko styl.");
  await page.getByRole("button", { name: "Zapisz kartę", exact: true }).click();
  const scan = await new AxeBuilder({ page }).analyze();
  expect(scan.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual(
    [],
  );
  await page.goto("/#/aplikuj/ai-product-manager");
  await page.getByText("Sprawdź kartę przed wysłaniem", { exact: true }).click();
  await expect(page.getByText(/Uporządkowałam typy reklamacji/)).toBeVisible();
  await page
    .getByLabel("Dlaczego pasujesz do tej roli?")
    .fill("Mam doświadczenie w projektowaniu i sprawdzaniu podobnych rozwiązań.");
  await page.getByRole("checkbox", { name: /^Zatwierdzam treść i przesłanie aplikacji/ }).check();
  await page.getByRole("checkbox", { name: /^Dołącz kartę doświadczenia z AI/ }).uncheck();
  await expect(
    page.getByRole("checkbox", { name: /^Zatwierdzam treść i przesłanie aplikacji/ }),
  ).not.toBeChecked();
  await page.getByRole("button", { name: "Zapisz szkic", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("checkbox", { name: /^Dołącz kartę doświadczenia z AI/ }),
  ).not.toBeChecked();
  await page.getByRole("checkbox", { name: /^Dołącz kartę doświadczenia z AI/ }).check();
  await page.getByRole("button", { name: "Zapisz szkic", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("checkbox", { name: /^Dołącz kartę doświadczenia z AI/ }),
  ).toBeChecked();
  await page.getByRole("checkbox", { name: /^Zatwierdzam treść i przesłanie aplikacji/ }).check();
  await page.getByRole("button", { name: "Wyślij aplikację", exact: true }).click();
  await expect(page).toHaveURL(/app\/aplikacje\?wyslano=1/);
  await page.getByRole("link", { name: "AI Product Manager", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Karta AI", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByText(/Uporządkowałam typy reklamacji/)).toBeVisible();
  await page.goto("/#/app/profil/karta");
  await page.getByLabel("Twój wkład i efekt pracy", { exact: true }).fill("NOWA WERSJA PROFILU");
  await page.getByRole("button", { name: "Zapisz kartę", exact: true }).click();
  await page.goto("/#/auth/sign-in");
  await page.getByRole("button", { name: "Wejdź jako Karolina Wiśniewska", exact: true }).click();
  await page.goto("/#/app/kandydaci");
  await page.getByRole("link", { name: "Anna Kowalska", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Karta AI", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByText(/Uporządkowałam typy reklamacji/)).toBeVisible();
  await expect(page.getByText("NOWA WERSJA PROFILU", { exact: true })).toHaveCount(0);
  await page.screenshot({
    path: "artifacts/candidate-experience-card/employer-card.png",
    fullPage: true,
  });
  await page.getByRole("tab", { name: "CV", exact: true }).click();
  await expect(page.getByRole("link", { name: "Pobierz CV (PDF)", exact: true })).toBeVisible();
});

for (const width of [1280, 850, 600, 390, 320]) {
  test(`card editor stays readable with optional fields and long Polish content at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#/auth/sign-in");
    await page.getByRole("button", { name: "Wejdź jako Anna Kowalska", exact: true }).click();
    await page.goto("/#/app/profil/karta");
    await expect(page.getByLabel("Przykład Twojej pracy", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Trudność i wyciągnięta lekcja", { exact: true })).toBeVisible();
    await page
      .getByLabel("Projekt lub produkt z wykorzystaniem AI", { exact: true })
      .fill(
        "Zażółć gęślą jaźń — długi opis pracy własnej i odpowiedzialności zespołu. ".repeat(12),
      );
    const overflow = await page.locator("main").evaluate((element) => {
      return [...element.querySelectorAll("input, textarea, select, button, h1, h2")]
        .filter((node) => {
          const r = node.getBoundingClientRect();
          return r.width > 0 && (r.left < 0 || r.right > window.innerWidth + 1);
        })
        .map((node) => node.textContent);
    });
    expect(overflow).toEqual([]);
    await expect(page.getByLabel("Etap projektu", { exact: true })).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `artifacts/candidate-experience-card/editor-${width}.png` });
    await page.locator(".experience-optional > button").focus();
    await page.locator(".experience-optional").evaluate((element) => {
      element.scrollIntoView({ block: "start", behavior: "instant" });
    });
    await page.screenshot({ path: `artifacts/candidate-card-clarity/optional-${width}.png` });
  });
}
