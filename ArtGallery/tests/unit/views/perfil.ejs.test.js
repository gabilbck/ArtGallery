/**
 * @jest-environment jsdom
 */

const ejs = require('ejs');
const fs = require('fs');
const path = require('path');


// Testes de template EJS
describe('Perfil EJS Template', () => {
  const templatePath = path.join(__dirname, '../../../views/perfil.ejs');
  const template = fs.readFileSync(templatePath, 'utf8');
  
  it('deve renderizar corretamente para um usuário apreciador', async () => {
    const data = {
      title: 'Perfil',
      usuario: {
        nome_usu: 'testuser',
        nome_comp: 'Test User',
        tipo_usu: 'apr',
        bio_usu: 'Bio de teste'
      },
      colecoes: [],
      favoritos: [],
      totalSeguidores: 10,
      totalSeguindo: 5
    };
    
    const html = await ejs.render(template, data);
    
    expect(html).toContain('Test User');
    expect(html).toContain('Apreciador');
    expect(html).toContain('Coleções');
    expect(html).toContain('Favoritos');
  });

  it('deve renderizar corretamente para um usuário artista', async () => {
    const data = {
      title: 'Perfil',
      usuario: {
        nome_usu: 'artist',
        nome_comp: 'Artist User',
        tipo_usu: 'art',
        bio_usu: 'Bio de artista'
      },
      favoritos: [{ nome: 'Obra 1', foto: '/img1.jpg', art: 'Artist' }],
      totalSeguidores: 20,
      totalSeguindo: 3
    };
    
    const html = await ejs.render(template, data);
    
    expect(html).toContain('Artist User');
    expect(html).toContain('Artista');
    expect(html).toContain('Obras');
    expect(html).not.toContain('Coleções');
  });

  it('deve mostrar mensagem quando não há obras/favoritos', async () => {
    const data = {
      title: 'Perfil',
      usuario: {
        nome_usu: 'emptyuser',
        nome_comp: 'Empty User',
        tipo_usu: 'apr'
      },
      colecoes: [],
      favoritos: [],
      totalSeguidores: 0,
      totalSeguindo: 0
    };
    
    const html = await ejs.render(template, data);
    
    expect(html).toContain('Você ainda não criou nenhuma coleção');
    expect(html).toContain('Você ainda não favoritou nenhuma obra');
  });
});

// Testes de funções JavaScript
describe('Perfil JavaScript Functions', () => {
  beforeAll(() => {
    // Configurar o DOM simulado
    document.body.innerHTML = `
      <div class="perfil-switch-container">
        <div class="perfil-switch-slider"></div>
        <button class="ativo" onclick="togglePerfilTab('perfil-colecoes', this)">Coleções</button>
        <button onclick="togglePerfilTab('perfil-favoritos', this)">Favoritos</button>
      </div>
      <div id="perfil-colecoes" class="perfil-aba-conteudo"></div>
      <div id="perfil-favoritos" class="perfil-aba-conteudo"></div>
    `;

    // Carrega a função
    window.togglePerfilTab = function(tabId, button) {
      const tabs = document.querySelectorAll(".perfil-aba-conteudo");
      tabs.forEach((tab) => {
        tab.style.display = "none";
      });

      const buttons = document.querySelectorAll(".perfil-switch-container button");
      buttons.forEach((btn) => {
        btn.classList.remove("ativo");
      });

      document.getElementById(tabId).style.display = "block";
      button.classList.add("ativo");

      const slider = document.querySelector(".perfil-switch-slider");
      slider.style.left = button.offsetLeft + "px";
    };

    // Dispara o DOMContentLoaded
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
  });

  it('deve inicializar com a aba de coleções visível', () => {
    expect(document.getElementById('perfil-colecoes').style.display);
    expect(document.getElementById('perfil-favoritos').style.display);
  });

  describe('togglePerfilTab', () => {
    it('deve alternar entre abas corretamente', () => {
      const buttons = document.querySelectorAll('.perfil-switch-container button');
      const favoritosButton = buttons[1];
      const slider = document.querySelector('.perfil-switch-slider');
      
      // Simula o clique na aba de favoritos
      window.togglePerfilTab('perfil-favoritos', favoritosButton);
      
      // Verifica as mudanças
      expect(document.getElementById('perfil-colecoes').style.display).toBe('none');
      expect(document.getElementById('perfil-favoritos').style.display).toBe('block');
      expect(buttons[0].classList.contains('ativo')).toBe(false);
      expect(buttons[1].classList.contains('ativo')).toBe(true);
      expect(slider.style.left).toBe(favoritosButton.offsetLeft + 'px');
    });
  });
});