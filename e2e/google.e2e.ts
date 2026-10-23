import { expect, test } from "@playwright/test";
import { calls, goTab, mockTauri } from "./mock";

const ALL_TABS = [
  "tasks", "notes", "clipboard", "agenda", "github", "gitlab", "steam", "status", "models", "agents",
  "weather", "market", "reads", "activity", "gmail", "gdrive", "contacts",
];

const GOOGLE = {
  gmail_summary: {
    unread: 27,
    important: [{ id: "m1", from: "Marina Lopes", subject: "Contrato revisado", snippet: "Consegue assinar?", date: Date.now(), link: "https://mail.google.com/mail/u/0/#inbox/t1", unread: true, starred: false }],
  },
  gmail_alerts_get: false,
  gtasks_list: [{ id: "g1", title: "Renovar seguro do carro", due: "" }],
  gtasks_add: { id: "g2", title: "Enviar proposta", due: "" },
  contacts_list: {
    total: 2,
    items: [
      {
        id: "c1", name: "Marina Lopes", emails: ["marina@exemplo.com"], phones: ["+55 11 90000-0000"], org: "Vértice", title: "Diretora", starred: true,
        link: "https://contacts.google.com/person/c1", nickname: "Mari", department: "Vendas",
        birthday: { day: new Date().getDate(), month: new Date().getMonth() + 1, year: null },
        addresses: ["Rua A, 10, São Paulo"], urls: [], relations: [], note: "",
      },
      {
        id: "c2", name: "Rafael Prado", emails: ["rafael@exemplo.com"], phones: [], org: "Vértice", title: "", starred: false, link: "",
        nickname: "", department: "", birthday: null, addresses: [], urls: [], relations: [], note: "",
      },
    ],
  },
  gdrive_list: {
    files: [
      { id: "d1", name: "Roadmap Q4 2026", kind: "doc", link: "https://docs.google.com/document/d/d1/edit", modified: new Date().toISOString(), starred: true, editor: "", folder: "", size: 0 },
    ],
    next: "",
  },
  gdrive_quota: { used: 1_073_741_824, limit: 16_106_127_360 },
};

test("Gmail, Drive and Google Tasks work from their tabs", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, { hiddenTabs: [], knownTabs: ALL_TABS, fixed: GOOGLE });
  await page.goto("/");
  await expect(page.getByText("Renovar seguro do carro")).toBeVisible();
  await page.getByLabel("adicionar no Google Tarefas…").fill("Enviar proposta");
  await page.getByLabel("adicionar no Google Tarefas…").press("Enter");
  await expect.poll(async () => (await calls(page)).find((c) => c.cmd === "gtasks_add")?.args).toEqual({ title: "Enviar proposta" });

  await goTab(page, "Gmail");
  await expect(page.getByText("27", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "marcar como lido" }).click();
  await expect(page.getByText("Contrato revisado")).toHaveCount(0);

  await goTab(page, "Drive");
  await page.getByRole("button", { name: "abrir", exact: true }).click();
  await expect.poll(async () => (await calls(page)).find((c) => c.cmd === "open_link")?.args).toEqual({ url: "https://docs.google.com/document/d/d1/edit" });
});

test("Contatos lists the address book, filters it and opens a contact in Google", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, { hiddenTabs: [], knownTabs: ALL_TABS, fixed: GOOGLE });
  await page.goto("/");
  await goTab(page, "Contatos");
  const birthdays = page.getByRole("region", { name: "Aniversariantes de hoje" });
  await expect(birthdays.getByText("Marina Lopes")).toBeVisible();
  const row = page.locator("[data-contact=c1]");
  await page.getByLabel("buscar contato").fill("rafael");
  await expect(row).toHaveCount(0);
  await page.getByLabel("buscar contato").fill("");
  await row.getByText("Marina Lopes").click();
  await expect(row.getByText("Rua A, 10, São Paulo")).toBeVisible();
  await page.getByRole("button", { name: "abrir no Google Contatos" }).click();
  await expect.poll(async () => (await calls(page)).find((c) => c.cmd === "open_link")?.args).toEqual({ url: "https://contacts.google.com/person/c1" });
  await page.getByRole("button", { name: "abrir +55 11 90000-0000 no WhatsApp" }).click();
  await expect.poll(async () => (await calls(page)).filter((c) => c.cmd === "open_link").at(-1)?.args).toEqual({ url: "https://wa.me/5511900000000" });
});

test("a hidden-tab choice lost with the webview's storage comes back from the file", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, { fixed: { prefs_get: { "canto.hiddenTabs": '["gitlab"]', "canto.knownTabs": JSON.stringify(ALL_TABS) } } });
  await page.goto("/");
  await expect(page.getByRole("tablist").first()).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("canto.hiddenTabs"))).toBe('["gitlab"]');
  await expect(page.getByRole("tab", { name: "Gmail", exact: true }).or(page.getByRole("button", { name: /mais/ })).first()).toBeVisible();
});

test("the Google tabs start hidden and the Tasks tab has no Google section without a login", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, { hiddenTabs: ["gitlab"], knownTabs: ["tasks", "notes", "clipboard", "agenda", "github", "gitlab"] });
  await page.goto("/");
  await expect(page.getByRole("tablist").first()).toBeVisible();
  await expect(page.getByRole("tab", { name: "Gmail", exact: true })).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "Drive", exact: true })).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "Contatos", exact: true })).toHaveCount(0);
  await expect(page.getByText("Google Tarefas")).toHaveCount(0);
});
