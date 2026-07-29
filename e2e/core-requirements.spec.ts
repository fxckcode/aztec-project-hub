import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

test.describe("Sistema de gestión de proyectos", () => {
  // Seed localStorage first by loading dashboard
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE, { waitUntil: "networkidle" });
    // Wait for client hydration — the store seeds localStorage
    await page.waitForTimeout(3000);
  });

  test("Dashboard carga con stats y listas", async ({ page }) => {
    await expect(page.getByText("Total de proyectos")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Necesita Atención")).toBeVisible();
    await expect(page.getByText("Proyectos Priorizados")).toBeVisible();
  });

  test("Tabla de proyectos con filtros, sorting y navegación", async ({ page }) => {
    await page.getByText("Proyectos").first().click();
    await page.waitForURL("/projects");
    await page.waitForTimeout(1000);

    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Todos").first()).toBeVisible();

    // Filter
    await page.getByText("Bloqueados").first().click();
    await page.waitForTimeout(300);

    // Navigate to detail
    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 5000 });
    await rows.first().click();
    await expect(page).toHaveURL(/\/projects\/prj-/);
  });

  test("Formulario crear proyecto tiene todos los campos", async ({ page }) => {
    await page.getByText("Proyectos").first().click();
    await page.waitForURL("/projects");
    await page.getByText("Nuevo").first().click();
    await page.waitForURL("/projects/new");
    await page.waitForTimeout(1000);

    await expect(page.getByText("Información Básica")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Nombre del Proyecto *")).toBeVisible();
    await expect(page.getByText("Cliente *")).toBeVisible();
    await expect(page.getByText("Responsable").first()).toBeVisible();
    await expect(page.getByText("Fechas y Valor")).toBeVisible();
  });

  test("Detalle de proyecto muestra información, riesgos y tareas", async ({ page }) => {
    await page.goto(`${BASE}/projects/prj-04`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    await expect(page.getByText("Quotation Engine").first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Riesgos").first()).toBeVisible();
    await expect(page.getByText("Tareas").first()).toBeVisible();
    await expect(page.getByText("Editar").first()).toBeVisible();
  });

  test("Risk Board muestra proyectos agrupados", async ({ page }) => {
    await page.getByText("Riesgos").first().click();
    await page.waitForURL("/risks");
    await page.waitForTimeout(1000);

    await expect(page.locator("section").filter({ hasText: "Bloqueados" }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("section").filter({ hasText: "En Riesgo" }).first()).toBeVisible();
    await expect(page.locator("section").filter({ hasText: "Saludables" }).first()).toBeVisible();
  });

  test("Team grid con estados y carga laboral", async ({ page }) => {
    await page.getByText("Equipo").first().click();
    await page.waitForURL("/team");
    await page.waitForTimeout(1000);

    await expect(page.getByText("Sobrecargados")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Al Límite")).toBeVisible();
    await expect(page.getByText("Disponibles")).toBeVisible();
  });

  test("Sidebar navega correctamente", async ({ page }) => {
    await page.getByText("Proyectos").first().click();
    await expect(page).toHaveURL(/\/projects$/);

    await page.getByText("Equipo").first().click();
    await expect(page).toHaveURL(/\/team$/);

    await page.getByText("Riesgos").first().click();
    await expect(page).toHaveURL(/\/risks$/);

    await page.getByText("Dashboard").first().click();
    await expect(page).toHaveURL(/\/$/);
  });
});
