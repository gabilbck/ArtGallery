const request = require('supertest');
const mysql = require('mysql2/promise');
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'artgallery_test'
};

// Importar app após mockar o servidor
let app;
let serverInstance;

describe('Perfil Integration Tests (MySQL)', () => {
  let connection;
  let authCookie;
  let testUserId;
  let testUser2Id;

  beforeAll(async () => {
    // 1. Criar conexão com o banco
    connection = await mysql.createPool(dbConfig);

    // 2. Limpar e preparar banco de dados
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE usuarios');
    await connection.query('TRUNCATE TABLE seguidores');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // 3. Inserir usuários de teste
    const [userResult] = await connection.query(
      'INSERT INTO usuarios (nome_usu, nome_comp, email_usu, senha_usu, tipo_usu) VALUES (?, ?, ?, ?, ?)',
      ['testuser', 'Test User', 'test@example.com', '$2b$10$ExampleHash', 'apr']
    );
    testUserId = userResult.insertId;

    const [user2Result] = await connection.query(
      'INSERT INTO usuarios (nome_usu, nome_comp, email_usu, senha_usu, tipo_usu) VALUES (?, ?, ?, ?, ?)',
      ['user2', 'User Two', 'user2@example.com', '$2b$10$ExampleHash', 'apr']
    );
    testUser2Id = user2Result.insertId;

    // 4. Carregar app somente agora (para evitar vazamento)
    app = require('../../app');
    
    // 5. Criar servidor em porta aleatória para testes
    serverInstance = app.listen(0);

    // 6. Simular login
    const loginRes = await request(app)
      .post('/login')
      .send({ email: 'test@example.com', senha: 'password123' });
    authCookie = loginRes.headers['set-cookie'][0];
  });

  afterAll(async () => {
    // Encerrar na ordem correta
    await new Promise(resolve => serverInstance.close(resolve));
    await connection.end();
    
    // Forçar saída para evitar open handles
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  describe('Operações de Perfil', () => {
    it('deve seguir e desseguir um usuário', async () => {
      // Testar seguir
      await request(app)
        .post(`/perfil/seguir/${testUser2Id}`)
        .set('Cookie', authCookie)
        .expect(302);

      // Verificar no banco
      const [seguidores] = await connection.query(
        'SELECT * FROM seguidores WHERE seguidor_id = ? AND seguindo_id = ?',
        [testUserId, testUser2Id]
      );
      expect(seguidores.length).toBe(1);

      // Testar desseguir
      await request(app)
        .post(`/perfil/desseguir/${testUser2Id}`)
        .set('Cookie', authCookie)
        .expect(302);

      // Verificar novamente
      const [seguidoresPos] = await connection.query(
        'SELECT * FROM seguidores WHERE seguidor_id = ? AND seguindo_id = ?',
        [testUserId, testUser2Id]
      );
      expect(seguidoresPos.length).toBe(0);
    });
  });
});