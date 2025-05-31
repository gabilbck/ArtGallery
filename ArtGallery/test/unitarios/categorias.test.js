const request = require('supertest');
const express = require('express');
const session = require('express-session');
const categoriasRouter = require("../../routes/categorias");

jest.mock("../../banco", () => ({
  buscarTodasCategorias: jest.fn(),
  buscarUmaCategoria: jest.fn(),
  buscarObrasPorCategoria9: jest.fn(),
  buscarArtistasPorCategoriaDeObra: jest.fn(),
  buscarObrasPorCategoria: jest.fn(),
}));

const banco = require("../../banco");

function createApp({ logged = false } = {}) {
  const app = express();
  app.use(express.json());
  app.use(session({ secret: 'test', resave: false, saveUninitialized: true }));
  app.use((req, res, next) => {
    if (logged) {
      req.session.usuario = { id: 1, nome: 'Tester' };
    }
    res.render = (view, data) => res.json({ view, data });
    next();
  });
  app.use('/categorias', categoriasRouter);
  return app;
}

describe('Rotas /categorias', () => {
  beforeEach(() => jest.clearAllMocks());

  test('GET /categorias redireciona para /login quando não autenticado', async () => {
    const app = createApp();
    const res = await request(app).get('/categorias');
    expect(res.status).toBe(302);
    expect(res.header.location).toBe('/login');
  });

  test('GET /categorias devolve lista quando autenticado', async () => {
    banco.buscarTodasCategorias.mockResolvedValue([
      { id: 1, nome: 'Pintura', foto: 'pintura.jpg' },
    ]);
    const app = createApp({ logged: true });
    const res = await request(app).get('/categorias');
    expect(res.status).toBe(200);
    expect(res.body.view).toBe('categorias');
    expect(res.body.data.itens).toHaveLength(1);
    expect(res.body.data.itens[0]).toMatchObject({
      id: 1,
      nome: 'Pintura',
      tabela: 'categoria',
    });
  });

  test('GET /categorias/:id retorna 404 se categoria não existe', async () => {
    banco.buscarUmaCategoria.mockResolvedValue(null);
    const app = createApp({ logged: true });
    const res = await request(app).get('/categorias/99');
    expect(res.status).toBe(404);
  });

  test('GET /categorias/:id retorna dados completos', async () => {
    banco.buscarUmaCategoria.mockResolvedValue({
      id: 2,
      nome: 'Escultura',
      desc: 'Descrição escultura',
      foto: 'escultura.jpg',
    });
    banco.buscarObrasPorCategoria9.mockResolvedValue([]);
    banco.buscarArtistasPorCategoriaDeObra.mockResolvedValue([]);
    banco.buscarObrasPorCategoria.mockResolvedValue([]);
    const app = createApp({ logged: true });
    const res = await request(app).get('/categorias/2');
    expect(res.status).toBe(200);
    expect(res.body.view).toBe('categoriasID');
    expect(res.body.data.categoria.nome).toBe('Escultura');
  });
});
