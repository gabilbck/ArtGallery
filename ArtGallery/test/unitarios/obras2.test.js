const request = require('supertest');
const express = require('express');
const session = require('express-session');
const obrasRouter = require('../../routes/obras');
const { 
  buscarUmaObra, 
  buscarComentariosPorObra, 
  comentarObra, 
  excluirComentario,
  jaFavoritou,
  favoritarObra,
  desfavoritarObra,
  contarFavoritos
} = require('../../banco');

// Mock do módulo banco.js
jest.mock('../../banco', () => ({
  buscarUmaObra: jest.fn(),
  buscarComentariosPorObra: jest.fn(),
  comentarObra: jest.fn(),
  excluirComentario: jest.fn(),
  jaFavoritou: jest.fn(),
  favoritarObra: jest.fn(),
  desfavoritarObra: jest.fn(),
  contarFavoritos: jest.fn()
}));

// Configuração do app de teste
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use((req, res, next) => {
  // Middleware para simular usuário logado quando necessário
  if (req.headers['x-test-user']) {
    req.session.usuario = {
      id_usu: req.headers['x-test-user'],
      nome_usu: 'testuser',
      tipo_usu: 'apr'
    };
  }
  next();
});
app.use('/obras', obrasRouter);

describe('Testes para o módulo de obras', () => {
  beforeEach(() => {
    // Resetar mocks antes de cada teste
    jest.clearAllMocks();
    
    // Configuração padrão dos mocks
    buscarUmaObra.mockImplementation((id) => {
      if (id === '1') return Promise.resolve({
        id: '1',
        titulo: 'Obra Teste',
        id_art: '2',
        id_usu_art: '2',
        artU: 'artista1',
        artC: 'Artista Um',
        foto: '/uploads/test.jpg',
        des: 'Descrição teste',
        qcom: 1,
        qfav: 5
      });
      return Promise.resolve(null);
    });

    buscarComentariosPorObra.mockImplementation((id) => {
      if (id === '1') return Promise.resolve([
        {
          id_com: '1',
          id_usu: '3',
          id_obr: '1',
          texto: 'Comentário teste',
          usu: 'usuario1',
          nome: 'Usuário Um',
          foto: '/uploads/user.jpg'
        }
      ]);
      return Promise.resolve([]);
    });

    jaFavoritou.mockResolvedValue(false);
    contarFavoritos.mockResolvedValue(5);
  });

  describe('UT-018 - Insere comentário em obra', () => {
    it('deve permitir que usuário autenticado comente em uma obra', async () => {
      // Mock da função comentarObra
      comentarObra.mockResolvedValue(true);

      const response = await request(app)
        .post('/obras/1/comentar')
        .set('x-test-user', '3') // Simula usuário logado
        .send({ comentario: 'Novo comentário' });

      expect(response.statusCode).toBe(302); // Redirecionamento
      expect(response.headers.location).toBe('/obras/1');
      expect(comentarObra).toHaveBeenCalledWith('3', '1', 'Novo comentário');
    });

    it('não deve permitir comentário vazio ou muito longo', async () => {
      // Teste com comentário vazio
      const responseVazio = await request(app)
        .post('/obras/1/comentar')
        .set('x-test-user', '3')
        .send({ comentario: '' });

      expect(responseVazio.statusCode).toBe(302);
      expect(responseVazio.headers.location).toBe('/obras/1');

      // Teste com comentário longo
      const longComment = 'a'.repeat(256);
      const responseLongo = await request(app)
        .post('/obras/1/comentar')
        .set('x-test-user', '3')
        .send({ comentario: longComment });

      expect(responseLongo.statusCode).toBe(302);
      expect(responseLongo.headers.location).toBe('/obras/1');
    });

    it('não deve permitir comentar sem autenticação', async () => {
      const response = await request(app)
        .post('/obras/1/comentar')
        .send({ comentario: 'Comentário teste' });

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/login');
    });
  });

  describe('UT-019 - Usuário que comentou deleta comentário na obra', () => {
    it('deve permitir que o autor do comentário o exclua', async () => {
      // Mock da função excluirComentario
      excluirComentario.mockResolvedValue(true);

      const response = await request(app)
        .post('/obras/1/comentarios/1/excluir')
        .set('x-test-user', '3'); // ID do usuário dono do comentário

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/obras/1');
      expect(excluirComentario).toHaveBeenCalledWith('1');
    });
  });

  describe('UT-020 - Usuário dono da obra deleta comentários', () => {
    it('deve permitir que o dono da obra exclua qualquer comentário', async () => {
      // Mock da função excluirComentario
      excluirComentario.mockResolvedValue(true);

      const response = await request(app)
        .post('/obras/1/comentarios/1/excluir')
        .set('x-test-user', '2'); // ID do artista dono da obra

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/obras/1');
      expect(excluirComentario).toHaveBeenCalledWith('1');
    });

    it('não deve permitir que outros usuários excluam comentários', async () => {
      const response = await request(app)
        .post('/obras/1/comentarios/1/excluir')
        .set('x-test-user', '4'); // ID de usuário não autorizado

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/obras/1');
      expect(excluirComentario).not.toHaveBeenCalled();
    });
  });

  describe('UT-028 - Favorita Obra', () => {
    it('deve permitir que usuário autenticado favorite uma obra', async () => {
      // Configurar mocks
      jaFavoritou.mockResolvedValue(false);
      favoritarObra.mockResolvedValue(true);
      contarFavoritos.mockResolvedValue(6); // Novo total após favoritar

      const response = await request(app)
        .post('/obras/1/favoritar')
        .set('x-test-user', '3');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        sucesso: true,
        favoritado: true,
        total: 6
      });
      expect(favoritarObra).toHaveBeenCalledWith('3', '1');
    });

    it('deve permitir que usuário autenticado desfavorite uma obra', async () => {
      // Configurar mocks para simular obra já favoritada
      jaFavoritou.mockResolvedValue(true);
      desfavoritarObra.mockResolvedValue(true);
      contarFavoritos.mockResolvedValue(4); // Novo total após desfavoritar

      const response = await request(app)
        .post('/obras/1/favoritar')
        .set('x-test-user', '3');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        sucesso: true,
        favoritado: false,
        total: 4
      });
      expect(desfavoritarObra).toHaveBeenCalledWith('3', '1');
    });

    it('não deve permitir favoritar sem autenticação', async () => {
      const response = await request(app)
        .post('/obras/1/favoritar');

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        sucesso: false,
        mensagem: "Não autenticado"
      });
    });
  });
});