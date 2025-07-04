// Teste// test/unitarios/colecao.test.js
const request = require('supertest');
const express = require('express');
const session = require('express-session');
const colecaoRouter = require('../../routes/colecao');
const { 
  buscarDadosUsuarioPorId,
  buscarColecaoPorUsu,
  buscarObrasPorColecao,
  criarColecao,
  excluirColecao,
  atualizarColecao,
  adicionarObraColecao,
  excluirObraColecao
} = require('../../banco');

// Mock do banco de dados
jest.mock('../../banco', () => ({
  buscarDadosUsuarioPorId: jest.fn(),
  buscarColecaoPorUsu: jest.fn(),
  buscarObrasPorColecao: jest.fn(),
  criarColecao: jest.fn(),
  excluirColecao: jest.fn(),
  atualizarColecao: jest.fn(),
  adicionarObraColecao: jest.fn(),
  excluirObraColecao: jest.fn()
}));

// Configuração do app de teste
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'testsecret',
  resave: false,
  saveUninitialized: true
}));
app.use('/colecao', colecaoRouter);

describe('Testes para o roteador de coleções', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /colecao/', () => {
    it('deve redirecionar para login se não houver sessão', async () => {
      const response = await request(app).get('/colecao/');
      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/login');
    });

    it('deve redirecionar para verTodas com id_usu da sessão', async () => {
      const mockSession = { usuario: { id_usu: 1 } };
      const response = await request(app)
        .get('/colecao/')
        .set('Cookie', [`connect.sid=${JSON.stringify(mockSession)}`]);
      
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
      const mockSession = { usuario: { id_usu: 1, nome_usu: 'testuser' } };
      const mockColecoes = [{ id_colecao: 1, nome_colecao: 'Coleção 1', foto_obra: '/uploads/img1.jpg' }];
      
      buscarColecaoPorUsu.mockResolvedValue(mockColecoes);
      buscarDadosUsuarioPorId.mockResolvedValue({ id_usu: 1, nome_usu: 'testuser' });

      const response = await request(app)
        .get('/colecao/verTodas/1')
        .set('Cookie', [`connect.sid=${JSON.stringify(mockSession)}`]);
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('Coleções de testuser');
      expect(buscarColecaoPorUsu).toHaveBeenCalledWith(1);
    });

    it('deve redirecionar para criarColecao se não houver coleções', async () => {
      const mockSession = { usuario: { id_usu: 1 } };
      buscarColecaoPorUsu.mockResolvedValue([]);
      
      const response = await request(app)
        .get('/colecao/verTodas/1')
        .set('Cookie', [`connect.sid=${JSON.stringify(mockSession)}`]);
      
      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/colecao/criarColecao');
    });
  });

  describe('GET /colecao/ver/:id', () => {
    it('deve renderizar colecaoID.ejs com dados corretos', async () => {
      const mockSession = { usuario: { id_usu: 1, nome_usu: 'testuser' } };
      const mockObras = [
        { id_obr: 1, titulo: 'Obra 1', foto: '/uploads/img1.jpg', id_col: 1, nome_colecao: 'Coleção 1', nome_usuario: 'testuser' }
      ];
      
      buscarObrasPorColecao.mockResolvedValue(mockObras);

      const response = await request(app)
        .get('/colecao/ver/1')
        .set('Cookie', [`connect.sid=${JSON.stringify(mockSession)}`]);
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('Coleção: Coleção 1');
      expect(buscarObrasPorColecao).toHaveBeenCalledWith('1');
    });

    it('deve lidar com coleções vazias corretamente', async () => {
      const mockSession = { usuario: { id_usu: 1 } };
      const mockColecoes = [{ id_col: 1, nome_col: 'Coleção Vazia' }];
      
      buscarObrasPorColecao.mockResolvedValue([]);
      buscarColecaoPorUsu.mockResolvedValue(mockColecoes);

      const response = await request(app)
        .get('/colecao/ver/1')
        .set('Cookie', [`connect.sid=${JSON.stringify(mockSession)}`]);
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('Esta coleção ainda não possui obras');
    });
  });

  describe('POST /colecao/criarColecao', () => {
    it('deve criar uma nova coleção e redirecionar', async () => {
      const mockSession = { usuario: { id_usu: 1 } };
      criarColecao.mockResolvedValue(1);
      
      const response = await request(app)
        .post('/colecao/criarColecao')
        .set('Cookie', [`connect.sid=${JSON.stringify(mockSession)}`])
        .send({ nome_col: 'Nova Coleção' });
      
      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/colecao/criarColecao');
      expect(criarColecao).toHaveBeenCalledWith(1, 'Nova Coleção');
    });

    it('deve lidar com nome vazio', async () => {
      const mockSession = { usuario: { id_usu: 1 } };
      
      const response = await request(app)
        .post('/colecao/criarColecao')
        .set('Cookie', [`connect.sid=${JSON.stringify(mockSession)}`])
        .send({ nome_col: '' });
      
      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/colecao/criarColecao');
    });
  });

  describe('POST /colecao/adicionarObra', () => {
    it('deve adicionar uma obra à coleção', async () => {
      const mockSession = { usuario: { id_usu: 1 } };
      buscarColecaoPorUsu.mockResolvedValue([{ id_colecao: 1 }]);
      adicionarObraColecao.mockResolvedValue(true);
      
      const response = await request(app)
        .post('/colecao/adicionarObra')
        .set('Cookie', [`connect.sid=${JSON.stringify(mockSession)}`])
        .send({ id_col: 1, id_obr: 1 });
      
      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/colecao/ver/1');
      expect(adicionarObraColecao).toHaveBeenCalledWith('1', '1');
    });
  });

  describe('POST /colecao/excluirColecao', () => {
    it('deve excluir uma coleção existente', async () => {
      const mockSession = { usuario: { id_usu: 1 } };
      buscarColecaoPorUsu.mockResolvedValue([{ id_colecao: 1 }]);
      excluirColecao.mockResolvedValue(true);
      
      const response = await request(app)
        .post('/colecao/excluirColecao')
        .set('Cookie', [`connect.sid=${JSON.stringify(mockSession)}`])
        .send({ id_col: 1 });
      
      expect(response.status).toBe(302);
      expect(excluirColecao).toHaveBeenCalledWith('1');
    });
  });
});