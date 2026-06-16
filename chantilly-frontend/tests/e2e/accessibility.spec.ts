import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { createCustomer, loginAdmin, loginCustomer, seedCart } from "./helpers/session";

async function expectNoSeriousViolations(page: Page, scope?: string) {
  const results = await new AxeBuilder({ page })
    .include(scope ?? "body")
    .analyze();

  const seriousViolations = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? ""),
  );

  expect(seriousViolations, JSON.stringify(seriousViolations, null, 2)).toEqual([]);
}

test("login cumple accesibilidad base", async ({ page }) => {
  await page.goto("/login");
  await expectNoSeriousViolations(page, "main, form, body");
});

test("checkout autenticado no expone violaciones serias", async ({ page, request }) => {
  const session = await createCustomer(request);
  await seedCart(request);
  await loginCustomer(page, session);
  await page.goto("/checkout");
  await expectNoSeriousViolations(page);
});

test("admin reportes mantiene accesibilidad crítica controlada", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/reportes");
  await expectNoSeriousViolations(page);
});
