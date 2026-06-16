import { expect, test } from "@playwright/test";
import { createCustomer, loginCustomer, seedCart } from "./helpers/session";

test("registro restringe caracteres inválidos en nombres", async ({ page }) => {
  await page.goto("/registro");
  await page.locator("#register-name").fill("123 Ana@@");
  await page.locator("#register-lastname").fill("Lopez99");
  await page.locator("#register-name").blur();
  await page.locator("#register-lastname").blur();

  await expect(page.locator("#register-name")).toHaveValue("Ana");
  await expect(page.locator("#register-lastname")).toHaveValue("Lopez");
  await expect(page.getByText("Nombre válido")).toBeVisible();
  await expect(page.getByText("Apellido válido")).toBeVisible();
});

test("checkout registra un pedido completo desde carrito autenticado", async ({ page, request }) => {
  const session = await createCustomer(request);
  await seedCart(request);
  await loginCustomer(page, { email: session.email as string, password: session.password as string });

  await page.goto("/checkout");
  await expect(page.getByText("Resumen operativo")).toBeVisible();
  await expect(page.getByText("PASO 1")).toHaveCount(0);

  await page.getByText("Recojo en tienda").first().click();
  await page.getByText("Yape").first().click();
  await page.locator("textarea").first().fill("YP-E2E-001");

  await expect(page.getByRole("button", { name: /Registrar pedido/i })).toBeEnabled();
  await page.getByRole("button", { name: /Registrar pedido/i }).click();

  await page.waitForURL(/\/confirmacion/);
  await expect(page.getByText("Tu celebración ya está en marcha")).toBeVisible();
});
