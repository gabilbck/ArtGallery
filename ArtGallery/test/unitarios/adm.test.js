const request = require('supertest');
const express = require('express');
const session = require('express-session');
const path = require('path');
const admIndexRouter = require('../../routes/_adm/_index');

// Mock completo do módulo banco.js
jest.mock('../../banco', () => ({
  buscarQtdApreciadores: jest.fn().mockResolvedValue(100),
  buscarQtdArtistas: jest.fn().mockResolvedValue(50),
  buscarQtdArtistasAguardandoLiberacao: jest.fn().mockResolvedValue(5),
  buscarQtdArtistasLiberados: jest.fn().mockResolvedValue(45),
  buscarQtdAdm: jest.fn().mockResolvedValue(3),
  buscarQtdBan: jest.fn().mockResolvedValue(2),
  buscarTotalUsuarios: jest.fn().mockResolvedValue(153)
}));

describe('Testes para o módulo de administração', () => {
  let app;
  let server;

  beforeAll(() => {
    app = express();
    
    // Configuração do view engine para os testes
    app.set('views', path.join(__dirname, '../../views'));
    app.set('view engine', 'ejs');
    
    app.use(express.urlencoded({ extended: false }));
    app.use(session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }
    }));

    // Middleware para simular usuário logado
    app.use((req, res, next) => {
      if (req.headers['x-test-user']) {
        req.session.usuario = {
          id_usu: req.headers['x-test-user'],
          nome_usu: 'testuser',
          tipo_usu: req.headers['x-test-user-type'] || 'apr'
        };
      }
      next();
    });

    app.use('/adm', admIndexRouter);
    
    // Mock da função render para evitar problemas com templates reais
    app.use((req, res, next) => {
      const originalRender = res.render;
      res.render = (view, data, callback) => {
        res.renderedData = data; // Armazena os dados para verificação
        originalRender.call(res, view, data, (err, html) => {
          if (err) return next(err);
          res.send(html); // Simula o envio do HTML renderizado
        });
      };
      next();
    });

    server = app.listen(0); // Porta aleatória para testes
  });

  afterAll((done) => {
    server.close(done); // Fecha o servidor após os testes
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('UT-026 - Administrador acessa o dashboard', () => {
    it('deve processar a rota /adm para administradores', async () => {
      const response = await request(app)
        .get('/adm')
        .set('x-test-user', '1')
        .set('x-test-user-type', 'adm');

      expect(response.statusCode).toBe(200);
      expect(response.text).toContain('Administração - ArtGallery');
    }, 15000); // Timeout aumentado para 15 segundos

    it('deve chamar todas as funções de consulta ao banco', async () => {
      await request(app)
        .get('/adm')
        .set('x-test-user', '1')
        .set('x-test-user-type', 'adm');

      const { buscarQtdApreciadores, buscarQtdArtistas, buscarQtdAdm } = require('../../banco');
      expect(buscarQtdApreciadores).toHaveBeenCalled();
      expect(buscarQtdArtistas).toHaveBeenCalled();
      expect(buscarQtdAdm).toHaveBeenCalled();
    }, 15000);
  });

  describe('UT-027 - Artista e apreciador não acessam dashboard', () => {
    it('deve redirecionar artistas para /', async () => {
      const response = await request(app)
        .get('/adm')
        .set('x-test-user', '2')
        .set('x-test-user-type', 'art');

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/');
    });

    it('deve redirecionar apreciadores para /', async () => {
      const response = await request(app)
        .get('/adm')
        .set('x-test-user', '3')
        .set('x-test-user-type', 'apr');

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/');
    });

    it('deve redirecionar para /login quando não autenticado', async () => {
      const response = await request(app)
        .get('/adm');

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/login');
    });
  });
});