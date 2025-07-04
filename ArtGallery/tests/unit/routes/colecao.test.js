// Sem alterações nesta parte — mantém os imports e mocks
const request = require('supertest');
const express = require('express');
const session = require('express-session');
const path = require('path');

jest.mock('../../../banco', () => ({
  buscarDadosUsuarioPorId: jest.fn(),
  buscarColecaoPorUsu: jest.fn(),
  buscarObrasPorColecao: jest.fn(),
  criarColecao: jest.fn(),
  excluirColecao: jest.fn(),
  atualizarColecao: jest.fn(),
  adicionarObraColecao: jest.fn(),
  excluirObraColecao: jest.fn(),
  query: jest.fn()
}));

const colecaoRouter = require('../../../routes/colecao');
const {
  buscarDadosUsuarioPorId,
  buscarColecaoPorUsu,
  buscarObrasPorColecao,
  criarColecao,
  excluirColecao,
  adicionarObraColecao
} = require('../../../banco');

const createTestApp = () => {
  const app = express();
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.set('views', path.join(__dirname, '../../../views'));
  app.set('view engine', 'ejs');

  app.use(session({
    secret: 'testsecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));

  app.post('/setup-session', (req, res) => {
    req.session.usuario = req.body;
    res.status(200).send();
  });

  app.use('/colecao', colecaoRouter);
  return app;
};

describe('Testes para o roteador de coleções', () => {
  let app;
  let agent;

  beforeEach(() => {
    app = createTestApp();
    agent = request.agent(app);
    jest.clearAllMocks();
  });

  describe('GET /colecao/', () => {
    it('deve redirecionar para login se não houver sessão', async () => {
      const response = await request(app).get('/colecao/');
      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/login');
    });

    it('deve redirecionar para verTodas com id_usu da sessão', async () => {
      await agent.post('/setup-session').send({ id_usu: 1 });
      const response = await agent.get('/colecao/');
      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/colecao/verTodas/1');
    });
  });

  describe('GET /colecao/verTodas/:id_usu', () => {
    it('deve redirecionar para login se não houver sessão', async () => {
      const response = await request(app).get('/colecao/verTodas/1');
      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/login');
    });

    it('deve renderizar colecoes.ejs com dados corretos', async () => {
      const mockColecoes = [{
        id_colecao: 1,
        nome_colecao: 'Coleção 1',
        foto_obra: '/uploads/img1.jpg'
      }];

      buscarColecaoPorUsu.mockResolvedValue(mockColecoes);
      buscarDadosUsuarioPorId.mockResolvedValue({
        id_usu: 1,
        nome_usu: 'testuser',
        foto_perfil: '/uploads/foto.jpg' // Adicionado
      });

      await agent.post('/setup-session').send({ id_usu: 1 });
      const response = await agent.get('/colecao/verTodas/1');

      expect(response.status).toBe(200);
      expect(buscarColecaoPorUsu).toHaveBeenCalledWith(1);
    });

    it('deve redirecionar para criarColecao se não houver coleções', async () => {
      buscarColecaoPorUsu.mockResolvedValue([]);
      buscarDadosUsuarioPorId.mockResolvedValue({
        id_usu: 1,
        nome_usu: 'testuser',
        foto_perfil: '/uploads/foto.jpg'
      });

      await agent.post('/setup-session').send({ id_usu: 1 });
      const response = await agent.get('/colecao/verTodas/1');

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/colecao/criarColecao');
    });
  });

  describe('GET /colecao/ver/:id', () => {
    it('deve renderizar colecaoID.ejs com dados corretos', async () => {
      const mockObras = [{
        id_obr: 1,
        titulo: 'Obra 1',
        foto: '/uploads/img1.jpg',
        id_col: 1,
        nome_colecao: 'Coleção 1',
        nome_usuario: 'testuser'
      }];

      buscarObrasPorColecao.mockResolvedValue(mockObras);
      await agent.post('/setup-session').send({ id_usu: 1 });

      const response = await agent.get('/colecao/ver/1');
      expect(response.status).toBe(200);
      expect(buscarObrasPorColecao).toHaveBeenCalledWith('1');
    });

    it('deve lidar com coleções vazias corretamente', async () => {
      buscarObrasPorColecao.mockResolvedValue([]);
      await agent.post('/setup-session').send({ id_usu: 1 });

      const response = await agent.get('/colecao/ver/1');
      expect(response.status).toBe(200);
    });
  });

  describe('POST /colecao/criarColecao', () => {
    it('deve criar uma nova coleção e redirecionar', async () => {
      criarColecao.mockResolvedValue(1);

      await agent.post('/setup-session').send({ id_usu: 1 });

      const response = await agent
        .post('/colecao/criarColecao')
        .send({ nome_col: 'Nova Coleção' });

      expect(response.status).toBe(302);
      expect(criarColecao).toHaveBeenCalledWith(1, 'Nova Coleção');
      expect(response.header.location).toBe('/colecao/verTodas/1');
    });

    it('deve lidar com nome vazio', async () => {
      await agent.post('/setup-session').send({ id_usu: 1 });

      const response = await agent
        .post('/colecao/criarColecao')
        .send({ nome_col: '' });

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/colecao/criarColecao');
    });
  });

  describe('POST /colecao/adicionarObra', () => {
    it('deve adicionar uma obra à coleção', async () => {
      adicionarObraColecao.mockResolvedValue(true);

      await agent.post('/setup-session').send({ id_usu: 1 });

      const response = await agent
        .post('/colecao/adicionarObra')
        .send({ id_col: 1, id_obr: 1 }); // ← números ao invés de string

      expect(response.status).toBe(302);
      expect(adicionarObraColecao).toHaveBeenCalledWith(1, 1); // ← números aqui também
    });
  });

  describe('POST /colecao/excluirColecao', () => {
    it('deve excluir uma coleção existente', async () => {
      excluirColecao.mockResolvedValue(true);

      await agent.post('/setup-session').send({ id_usu: 1 });

      const response = await agent
        .post('/colecao/excluirColecao')
        .send({ id_col: 1 }); // ← número, não string

      expect(response.status).toBe(302);
      expect(excluirColecao).toHaveBeenCalledWith(1);
      expect(response.header.location).toBe('/colecao/verTodas/1');
    });
  });
});
