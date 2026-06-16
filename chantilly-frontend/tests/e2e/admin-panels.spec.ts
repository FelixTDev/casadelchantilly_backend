import { expect, test } from "@playwright/test";
import { createOrderWithPayment, loginAdmin } from "./helpers/session";

test("admin productos muestra filtros y acciones masivas", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/productos");

  await expect(page.getByRole("button", { name: "Activar seleccionados", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Desactivar seleccionados", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Exportar selección", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Todos", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Activos", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Inactivos", exact: true })).toBeVisible();
});

test("admin pedidos y pagos muestran una orden recién creada", async ({ page, request }) => {
  const { pedido, pago } = await createOrderWithPayment(request);
  await loginAdmin(page);

  await page.goto("/admin/pedidos");
  await expect(page.getByText(pedido.codigoPedido)).toBeVisible();

  await page.goto("/admin/pagos");
  await expect(page.getByText(pago.referencia)).toBeVisible();
  await expect(page.getByText("Gestión de Pagos")).toBeVisible();
});

test("admin reportes carga filtros rápidos y exportables", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/reportes");

  await expect(page.getByText("Hoy")).toBeVisible();
  await expect(page.getByText("7 días")).toBeVisible();
  await expect(page.getByText("30 días")).toBeVisible();
  await expect(page.getByText("Personalizado")).toBeVisible();
  await expect(page.getByRole("button", { name: "PDF" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Excel" })).toBeVisible();
});
