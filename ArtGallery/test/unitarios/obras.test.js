const request = require('supertest');
const express = require('express');
const session = require('express-session');
const obrasRouter = require('../../routes/obras');

jest.mock('../../banco', () => ({
  jaFavoritou: jest.fn(),
  favoritarObraComDesbloqueio: jest.fn(),
  desfavoritarObra: jest.fn(),
  contarFavoritos: jest.fn(),
  buscarUmaObra: jest.fn(),
  buscarComentariosPorObra: jest.fn(),
}));

const banco = require('../../banco');

function createApp({ logged = false } = {}) {
  const app = express();
  app.use(express.json());
  app.use(session({ secret: 'test', resave: false, saveUninitialized: true }));
  if (logged) {
    app.use((req, res, next) => {
      req.session.usuario = { id: 1, nome: 'Tester' };
      next();
    });
  }
  app.use((req, res, next) => {
    res.render = (view, data) => res.json({ view, data });
    next();
  });
  app.use('/obras', obrasRouter);
  return app;
}

describe('Rotas /obras', () => {
  beforeEach(() => jest.clearAllMocks());

  test('GET /obras redireciona para /login quando não autenticado', async () => {
    const app = createApp();
    const res = await request(app).get('/obras');
    expect(res.status).toBe(302);
    expect(res.header.location).toBe('/login');
  });

  test('GET /obras retorna 200 e lista quando autenticado', async () => {
    banco.contarFavoritos.mockResolvedValue([]);
    const app = createApp({ logged: true });
    const res = await request(app).get('/obras');
    expect(res.status).toBe(200);
    expect(res.body.view).toBe('obras');
  });

  test('GET /obras/:id 404 quando obra inexistente', async () => {
    banco.buscarUmaObra.mockResolvedValue(null);
    const app = createApp({ logged: true });
    const res = await request(app).get('/obras/123');
    expect(res.status).toBe(404);
  });

  test('GET /obras/:id retorna detalhes da obra', async () => {
    banco.buscarUmaObra.mockResolvedValue({
      id: 5,
      titulo: 'Obra Teste',
      id_art: 2,
      artU: 'User',
      artC: 'Complete',
      foto: 'foto.jpg',
      des: 'Descrição',
      qcom: 0,
      qfav: 0,
    });
    banco.jaFavoritou.mockResolvedValue(false);
    banco.buscarComentariosPorObra.mockResolvedValue([]);
    const app = createApp({ logged: true });
    const res = await request(app).get('/obras/5');
    expect(res.status).toBe(200);
    expect(res.body.view).toBe('ObraID');
    expect(res.body.data.obra.titulo).toBe('Obra Teste');
  });
});
