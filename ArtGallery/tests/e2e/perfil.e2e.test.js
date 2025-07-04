const { test, expect } = require('@playwright/test');

test.describe('Perfil Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Fazer login antes de cada teste
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="senha"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/');
  });

  test('deve carregar a página de perfil corretamente', async ({ page }) => {
    await page.goto('http://localhost:3000/perfil');
    
    // Verificar elementos básicos
    await expect(page.locator('.perfil-nome-comp')).toHaveText('Test User');
    await expect(page.locator('.perfil-tipo')).toHaveText('Apreciador');
    
    // Verificar abas
    await expect(page.locator('#perfil-colecoes')).toBeVisible();
    await expect(page.locator('#perfil-favoritos')).not.toBeVisible();
  });

  test('deve alternar entre abas de coleções e favoritos', async ({ page }) => {
    await page.goto('http://localhost:3000/perfil');
    
    // Clicar na aba de favoritos
    await page.click('button:has-text("Favoritos")');
    
    // Verificar que a aba de favoritos está visível
    await expect(page.locator('#perfil-favoritos')).toBeVisible();
    await expect(page.locator('#perfil-colecoes')).not.toBeVisible();
    
    // Voltar para coleções
    await page.click('button:has-text("Coleções")');
    await expect(page.locator('#perfil-colecoes')).toBeVisible();
  });

  test('deve permitir seguir e deixar de seguir usuários', async ({ page }) => {
    // Visitar perfil de outro usuário
    await page.goto('http://localhost:3000/perfil/perfilVisitante/123');
    
    // Seguir
    await page.click('button:has-text("Follow")');
    await expect(page.locator('button:has-text("Unfollow")')).toBeVisible();
    
    // Deixar de seguir
    await page.click('button:has-text("Unfollow")');
    await expect(page.locator('button:has-text("Follow")')).toBeVisible();
  });

  test('deve mostrar obras para usuários artistas', async ({ page }) => {
    // Teste para perfil de artista
    await page.goto('http://localhost:3000/perfil/perfilVisitante/456');
    
    // Verificar seção de obras
    await expect(page.locator('h2:has-text("Obras")')).toBeVisible();
  });
});