// tests/unit/views/colecoes.test.js
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

// Configura caminhos absolutos para os templates
const templatesDir = path.join(__dirname, '../../../views');
const colecoesTemplatePath = path.join(templatesDir, 'colecoes.ejs');
const colecaoIDTemplatePath = path.join(templatesDir, 'colecaoID.ejs');

// Configuração básica do JSDOM
const setupDom = (html) => {
  const dom = new JSDOM(html);
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  return dom.window.document;
};

describe('Testes para colecoes.ejs', () => {
  let document;
  const mockData = {
    title: 'Coleções de testuser',
    usuario: { id_usu: 1, nome_usu: 'testuser' },
    colecoes: [
      { id: 1, nome: 'Coleção 1', foto: '/uploads/img1.jpg', id_usu: 1 },
      { id: 2, nome: 'Coleção 2', foto: '/uploads/img2.jpg', id_usu: 1 }
    ],
    id_usu: 1,
    erros: null,
    sucesso: 'Coleção criada com sucesso!'
  };

  beforeAll(() => {
    const template = fs.readFileSync(colecoesTemplatePath, 'utf8');
    const renderedHTML = ejs.render(template, mockData);
    document = setupDom(renderedHTML);
  });

  test('Renderiza o título corretamente', () => {
    const title = document.querySelector('h2');
    expect(title.textContent).toBe('Coleções de testuser');
  });

  test('Exibe mensagem de sucesso quando existir', () => {
    const successMsg = document.querySelector('.retorno-container#sucesso p');
    expect(successMsg.textContent).toBe('Coleção criada com sucesso!');
  });

  test('Renderiza a lista de coleções', () => {
    const collectionItems = document.querySelectorAll('.col-card');
    expect(collectionItems.length).toBe(2);
  });
});

describe('Testes para colecaoID.ejs', () => {
  let document;
  const mockData = {
    title: 'Detalhes da Coleção',
    colecao: {
      id_col: 1,
      nome_colecao: 'Minha Coleção',
      nome_usuario: 'testuser'
    },
    obras: [
      { id_obr: 1, titulo: 'Obra 1', foto: '/uploads/img1.jpg' },
      { id_obr: 2, titulo: 'Obra 2', foto: '/uploads/img2.jpg' }
    ],
    usuario: { id_usu: 1, nome_usu: 'testuser' },
    erros: null,
    sucesso: null
  };

  beforeAll(() => {
    const template = fs.readFileSync(colecaoIDTemplatePath, 'utf8');
    const renderedHTML = ejs.render(template, mockData);
    document = setupDom(renderedHTML);
  });

  test('Renderiza o nome da coleção corretamente', () => {
    const title = document.querySelector('h2');
    expect(title.textContent).toBe('Coleção: Minha Coleção');
  });

  test('Renderiza a lista de obras', () => {
    const obraItems = document.querySelectorAll('.col-card');
    expect(obraItems.length).toBe(2);
  });
});