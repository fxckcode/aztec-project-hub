import { test, expect } from "@playwright/test";

const BASE = "https://aztec-project-hub.vercel.app";

test.describe("Deploy en Vercel", () => {
  test("Dashboard carga con datos", async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(3000);
    await expect(page.getByText("Total de proyectos")).toBeVisible({ timeout: 20000 });
    await expect(page.getByText("Necesita Atención")).toBeVisible();
    await expect(page.getByText("Proyectos Priorizados")).toBeVisible();
  });

  test("Tabla de proyectos carga y se puede navegar", async ({ page }) => {
    await page.goto(`${BASE}/projects`);
    await page.waitForTimeout(3000);
    await expect(page.getByText("Todos").first()).toBeVisible({ timeout: 20000 });
    await expect(page.locator("table")).toBeVisible();
    await page.locator("table tbody tr").first().click();
    await expect(page).toHaveURL(/\/projects\/prj-/);
  });

  test("Formulario crear proyecto tiene campos", async ({ page }) => {
    await page.goto(`${BASE}/projects/new`);
    await page.waitForTimeout(3000);
    await expect(page.getByText("Información Básica")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Nombre del Proyecto *")).toBeVisible();
    await expect(page.getByText("Responsable").first()).toBeVisible();
  });

  test("Risk Board muestra grupos", async ({ page }) => {
    await page.goto(`${BASE}/risks`);
    await page.waitForTimeout(3000);
    await expect(page.getByText("Bloqueados").first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Saludables").first()).toBeVisible();
  });

  test("Team grid carga con miembros", async ({ page }) => {
    await page.goto(`${BASE}/team`);
    await page.waitForTimeout(3000);
    await expect(page.getByText("Sobrecargados")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Disponibles")).toBeVisible();
  });
});
