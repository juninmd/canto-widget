import { expect, test } from "@playwright/test";
import { CATALOGS } from "../src/i18n/catalogs";
import { languageNames, RTL_LANGUAGES } from "../src/i18n/languages";
import { calls, mockTauri } from "./mock";

for (const [language] of languageNames) {
  test(`${language}: translated tasks work and the native language is synchronized`, async ({ page }) => {
    const messages = CATALOGS[language];
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await mockTauri(page, { language });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    await expect(page.locator("html")).toHaveAttribute("dir", RTL_LANGUAGES.includes(language) ? "rtl" : "ltr");
    await expect(page.getByRole("tab", { name: messages["tabs.tasks"], exact: true })).toHaveAttribute("aria-selected", "true");
    await page.getByPlaceholder(messages["tasks.addPlaceholder"], { exact: true }).fill("Fictional task");
    await page.getByRole("button", { name: messages["tasks.add"], exact: true }).click();
    await expect(page.getByText("Fictional task").last()).toBeVisible();
    expect((await calls(page)).some((call) => call.cmd === "language_set" && call.args.lang === language)).toBe(true);
    await page.reload();
    await expect(page.getByText("Fictional task").last()).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("the searchable picker reloads into the chosen language at widget width", async ({ page }) => {
  await mockTauri(page, { language: "pt-BR" });
  await page.goto("/");
  await page.getByRole("button", { name: /^mais/ }).click();
  await page.getByRole("menuitem", { name: /^Ajustes/ }).click();
  await page.getByRole("searchbox", { name: "Buscar idioma" }).fill("ar");
  await page.getByRole("radio", { name: "العربية", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("tab", { name: CATALOGS.ar["tabs.tasks"], exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
