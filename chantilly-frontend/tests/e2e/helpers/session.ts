import type { APIRequestContext, Page } from "@playwright/test";

const API_BASE_URL = "http://localhost:8081/api";

async function parseJsonSafe(response: { json: () => Promise<unknown> }) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function expectOk(response: { ok: () => boolean; status: () => number; json: () => Promise<unknown> }, context: string) {
  if (response.ok()) {
    return;
  }

  const body = await parseJsonSafe(response);
  throw new Error(`${context} falló con ${response.status()}: ${JSON.stringify(body)}`);
}

function tomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

async function getAvailableProductId(request: APIRequestContext) {
  const response = await request.get(`${API_BASE_URL}/productos`);
  await expectOk(response, "Listado de productos");
  const products = (await response.json()) as Array<{ id?: number; disponible?: boolean; stock?: number | null }>;
  const product = products.find((item) => item.id && item.disponible !== false && Number(item.stock ?? 0) > 0);

  if (!product?.id) {
    throw new Error("No se encontró un producto disponible con stock para la suite E2E.");
  }

  return product.id;
}

async function csrfHeaders(request: APIRequestContext) {
  const response = await request.get(`${API_BASE_URL}/auth/csrf`);
  await expectOk(response, "CSRF bootstrap");
  const body = (await response.json()) as { mensaje: string };
  return { "X-XSRF-TOKEN": body.mensaje };
}

export async function createCustomer(request: APIRequestContext) {
  const email = `e2e.${Date.now()}@chantilly.test`;
  const headers = await csrfHeaders(request);
  const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
    headers,
    data: {
      nombre: "Lucia",
      apellido: "Prueba",
      email,
      telefono: "987654321",
      password: "clave123",
    },
  });
  await expectOk(registerResponse, "Registro E2E");

  const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
    headers: await csrfHeaders(request),
    data: { email, password: "clave123" },
  });
  await expectOk(loginResponse, "Login E2E");

  const session = await loginResponse.json() as Record<string, unknown>;
  return {
    ...session,
    email,
    password: "clave123",
  };
}

export async function seedCart(request: APIRequestContext, productoId?: number) {
  const resolvedProductId = productoId ?? await getAvailableProductId(request);
  const response = await request.post(`${API_BASE_URL}/carrito/items`, {
    headers: await csrfHeaders(request),
    data: { productoId: resolvedProductId, cantidad: 1 },
  });
  await expectOk(response, "Carga de carrito E2E");
}

export async function loginCustomer(page: Page, session: { email: string; password: string }) {
  await page.goto("http://localhost:4174/login");
  await page.locator("#login-email").fill(session.email);
  await page.locator("#login-password").fill(session.password);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await page.waitForURL(/\/catalogo/);
}

export async function createOrderWithPayment(request: APIRequestContext) {
  const session = await createCustomer(request);
  await seedCart(request);

  const pedidoResponse = await request.post(`${API_BASE_URL}/pedidos`, {
    headers: await csrfHeaders(request),
    data: {
      modalidadEntrega: "RECOJO_TIENDA",
      fechaEntrega: tomorrowDate(),
      notasCliente: "Orden de auditoría",
    },
  });
  await expectOk(pedidoResponse, "Creación de pedido E2E");
  const pedido = await pedidoResponse.json();

  const pagoResponse = await request.post(`${API_BASE_URL}/pagos?pedidoId=${pedido.id}`, {
    headers: await csrfHeaders(request),
    data: {
      metodoPago: "YAPE",
      referencia: `REF-${pedido.id}`,
    },
  });
  await expectOk(pagoResponse, "Registro de pago E2E");
  const pago = await pagoResponse.json();

  return { session, pedido, pago };
}

export async function loginAdmin(page: Page) {
  const request = page.context().request;
  const fingerprint = `203.0.113.${(Date.now() % 200) + 20}`;
  const csrfResponse = await request.get(`${API_BASE_URL}/auth/csrf`, {
    headers: { "X-Forwarded-For": fingerprint },
  });
  await expectOk(csrfResponse, "CSRF admin E2E");
  const csrfBody = await csrfResponse.json() as { mensaje: string };

  const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": fingerprint,
      "X-XSRF-TOKEN": csrfBody.mensaje,
    },
    data: {
      email: "admin@chantilly.com",
      password: "Admin123*",
    },
  });
  await expectOk(loginResponse, "Login admin E2E");

  await page.goto("http://localhost:4174/admin");
  await page.waitForURL(/\/admin/);
}
