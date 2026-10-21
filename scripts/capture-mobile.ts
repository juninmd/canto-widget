import { devices, test } from "@playwright/test";
import { mockTauri } from "../e2e/mock";

const { defaultBrowserType: _browser, ...phone } = devices["Pixel 7"];
test.use(phone);

const TASKS = ["Revisar o relatório de testes", "Responder o time de design", "Preparar a demo de sexta"];

test("capture the phone layout with fictitious data", async ({ page }) => {
  await mockTauri(page, {
    notes: [
      {
        id: "n1",
        title: "Ideias para a retro",
        body: "Falar do que funcionou no último ciclo.",
        tags: ["time"],
        created_at: 1_700_000_000_000,
        updated_at: 1_700_000_000_000,
      },
    ],
  });
  await page.goto("/");
  for (const title of TASKS) {
    await page.getByPlaceholder("nova tarefa (ex.: Daily às 9h30 !alta)").fill(title);
    await page.getByRole("button", { name: "adicionar tarefa" }).click();
    await page.getByText(title).last().waitFor();
  }
  await page.screenshot({ path: "docs/prints/mobile/01-tarefas.png" });

  await page.getByRole("button", { name: /^mais/ }).click();
  await page.getByRole("dialog").waitFor();
  await page.screenshot({ path: "docs/prints/mobile/02-abas.png" });

  await page.getByRole("dialog").getByRole("button", { name: "Ajustes" }).click();
  await page.getByRole("tabpanel").waitFor();
  await page.screenshot({ path: "docs/prints/mobile/03-ajustes.png" });
});
