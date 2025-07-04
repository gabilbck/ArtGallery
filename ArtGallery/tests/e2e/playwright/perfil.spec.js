const { test, expect } = require('@playwright/test');

test.describe('Página de Perfil', () => {
  test.beforeEach(async ({ page }) => {
    // Configuração inicial com timeout explícito
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Preenchimento mais robusto com espera explícita
    await page.locator('input[name="email"]').fill('ana01@email.com');
    await page.locator('input[name="senha"]').fill('senha123');
    
    // Clique com verificação de ação concluída
    await Promise.all([
      page.waitForNavigation(),
      page.locator('button[type="submit"]').click()
    ]);
    
    // Verificação de URL melhorada
    await expect(page).toHaveURL(/\/perfil/);
  });

  test('Deve exibir informações básicas do perfil', async ({ page }) => {
    // Padronização de seletores e verificações
    await expect(page.locator('.perfil-nome-comp')).toBeVisible();
    await expect(page.locator('.perfil-bio')).toBeVisible();
    await expect(page.locator('.perfil-avatar')).toBeVisible();
  });

  test('Alternância entre abas deve funcionar corretamente', async ({ page }) => {
    // Definição clara dos elementos
    const colecoesTab = page.locator('button:has-text("Coleções")');
    const favoritosTab = page.locator('button:has-text("Favoritos")');
    const conteudoColecoes = page.locator('#perfil-colecoes');
    const conteudoFavoritos = page.locator('#perfil-favoritos');

    // Teste da aba Favoritos
    await favoritosTab.click();
    await expect(conteudoFavoritos).toBeVisible();
    await expect(conteudoColecoes).toBeHidden();

    // Teste da aba Coleções
    await colecoesTab.click();
    await expect(conteudoColecoes).toBeVisible();
    await expect(conteudoFavoritos).toBeHidden();
  });

  test('Interação de seguir/desseguir usuário', async ({ page }) => {
    // Navegação com espera
    await page.goto('http://localhost:3000/perfil/perfilVisitante/2');
    await page.waitForLoadState('networkidle');

    // Elementos e lógica melhorada
    const followButton = page.locator('button:has-text("Follow")');
    const unfollowButton = page.locator('button:has-text("Unfollow")');

    // Verifica estado inicial e interage
    if (await followButton.isVisible()) {
      await followButton.click();
      await expect(unfollowButton).toBeVisible({ timeout: 3000 });
    } else {
      await unfollowButton.click();
      await expect(followButton).toBeVisible({ timeout: 3000 });
    }

    // Verifica mudança de estado
    if (await unfollowButton.isVisible()) {
      await unfollowButton.click();
      await expect(followButton).toBeVisible({ timeout: 3000 });
    }
  });

  test('Verificação de conteúdo das abas', async ({ page }) => {
    // Teste mais completo do conteúdo
    const colecoesTab = page.locator('button:has-text("Coleções")');
    await colecoesTab.click();
    
    await expect(page.locator('#perfil-colecoes .obra-item').first()).toBeVisible();
    
    const favoritosTab = page.locator('button:has-text("Favoritos")');
    await favoritosTab.click();
    
    await expect(page.locator('#perfil-favoritos .obra-item').first()).toBeVisible();
  });
});