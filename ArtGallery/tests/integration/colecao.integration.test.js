const request = require('supertest');
const app = require('../../app');
const db = require('../../banco');

// Mock do banco de dados para testes de integração
jest.mock('../../banco', () => ({
  query: jest.fn()
}));

describe('Testes de Integração para Coleções', () => {
  let server;
  let authCookie;
  let userId = 1; // ID fixo para testes
  let collectionId = 1; // ID fixo para testes

  beforeAll(async () => {
    // Inicia o servidor em uma porta aleatória
    server = app.listen(0);
    
    // Configura os mocks para as queries iniciais
    db.query
      .mockResolvedValueOnce([{ insertId: userId }]) // INSERT usuario
      .mockResolvedValueOnce([{ id_usu: userId }]) // SELECT usuario
      .mockResolvedValueOnce([{ // Mock do login (simula sessão)
        id_usu: userId,
        nome_usu: 'testuser',
        email_usu: 'test@example.com'
      }]);
    
    // Simula o login
    const loginRes = await request(server)
      .post('/login')
      .send({ email: 'test@example.com', senha: 'testpass' });
    
    authCookie = loginRes.headers['set-cookie'];
  });

  afterAll(async () => {
    // Fecha o servidor
    await server.close();
  });

  describe('Criação de coleção', () => {
    it('deve criar uma nova coleção', async () => {
      // Configura o mock para a criação da coleção
      db.query
        .mockResolvedValueOnce([{ insertId: collectionId }]); // INSERT colecao
      
      const res = await request(server)
        .post('/colecao/criarColecao')
        .set('Cookie', authCookie)
        .send({ nome_col: 'Minha Coleção' });
      
      expect(res.statusCode).toBe(302);
      
      // Verifica se a query de inserção foi chamada
      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO colecao (nome_col, id_usu) VALUES (?, ?)",
        ['Minha Coleção', userId]
      );
    });
  });

  describe('Adicionar obra à coleção', () => {
    it('deve adicionar uma obra à coleção', async () => {
      const obraId = 1;
      
      // Configura os mocks para as queries
      db.query
        .mockResolvedValueOnce([{ id_obr: obraId }]) // SELECT obra
        .mockResolvedValueOnce([{ insertId: 1 }]); // INSERT obra_colecao
      
      const res = await request(server)
        .post('/colecao/adicionarObra')
        .set('Cookie', authCookie)
        .send({ id_col: collectionId, id_obr: obraId });
      
      expect(res.statusCode).toBe(302);
      
      // Verifica se a query de associação foi chamada
      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO obra_colecao (id_col, id_obr) VALUES (?, ?)",
        [collectionId, obraId]
      );
    });
  });

  describe('Listar coleções do usuário', () => {
    it('deve listar as coleções do usuário', async () => {
      // Configura o mock para retornar coleções
      db.query
        .mockResolvedValueOnce([{ // SELECT colecao
          id_col: collectionId,
          nome_col: 'Minha Coleção',
          id_usu: userId
        }]);
      
      const res = await request(server)
        .get(`/colecao/verTodas/${userId}`)
        .set('Cookie', authCookie);
      
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Minha Coleção');
    });
  });
});