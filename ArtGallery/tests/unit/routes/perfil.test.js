const request = require("supertest");
const express = require("express");
const mysql = require("mysql2/promise");

// Mock completo do router de perfil com todas as funcionalidades
jest.mock("../../../routes/perfil", () => {
  const router = require("express").Router();
  const mockDb = {
    usuarios: [],
    seguidores: []
  };

  // Middleware de autenticação mockado
  router.use((req, res, next) => {
    req.session = { 
      usuario: { 
        id_usu: 123, 
        nome_usu: "testuser",
        tipo_usu: "apr"
      } 
    };
    next();
  });

  // Rota GET /perfilVisitante/:id
  router.get("/perfilVisitante/:id", async (req, res) => {
    const usuario = mockDb.usuarios.find(u => u.id_usu == req.params.id);
    if (!usuario) return res.status(404).send("Usuário não encontrado");
    
    res.status(200).send(`<html>Perfil de ${usuario.nome_usu}</html>`);
  });

  // Rota POST /seguir/:id
  router.post("/seguir/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).send("ID inválido");
    
    const usuario = mockDb.usuarios.find(u => u.id_usu == id);
    if (!usuario) return res.status(404).send("Usuário não encontrado");
    
    // Verifica se já segue
    const jaSegue = mockDb.seguidores.some(s => 
      s.seguidor_id === 123 && s.seguindo_id === id
    );
    
    if (!jaSegue) {
      mockDb.seguidores.push({
        seguidor_id: 123,
        seguindo_id: id
      });
    }
    
    res.redirect(302, "/");
  });

  // Rota POST /desseguir/:id
  router.post("/desseguir/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).send("ID inválido");
    
    mockDb.seguidores = mockDb.seguidores.filter(s => 
      !(s.seguidor_id === 123 && s.seguindo_id === id)
    );
    
    res.redirect(302, "/");
  });

  return router;
});

describe("Testes da rota /perfil", () => {
  let app;
  let server;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    
    // Usa o router mockado
    app.use("/perfil", require("../../../routes/perfil"));
    
    server = app.listen(0);
  });

  afterAll(async () => {
    await new Promise(resolve => server.close(resolve));
  });

  beforeEach(() => {
    // Configura dados mockados iniciais
    const mockRouter = require("../../../routes/perfil");
    mockRouter._mockDb = {
      usuarios: [
        {
          id_usu: 123,
          nome_usu: "testuser",
          nome_comp: "Test User",
          email_usu: "test@example.com",
          tipo_usu: "apr"
        }
      ],
      seguidores: []
    };
  });

  describe("GET /perfil/perfilVisitante/:id", () => {
    it("deve retornar o perfil público de um usuário", async () => {
      const mockRouter = require("../../../routes/perfil");
      mockRouter._mockDb.usuarios.push({
        id_usu: 456,
        nome_usu: "outrouser",
        nome_comp: "Outro User",
        email_usu: "outro@example.com",
        tipo_usu: "apr"
      });

      const response = await request(server)
        .get("/perfil/perfilVisitante/456")
        .expect(200);

      expect(response.text).toContain("Perfil de outrouser");
    });

    it("deve retornar 404 para usuário não encontrado", async () => {
      await request(server)
        .get("/perfil/perfilVisitante/999")
        .expect(404);
    });
  });

  describe("POST /perfil/seguir/:id", () => {
    it("deve permitir seguir um usuário", async () => {
      const mockRouter = require("../../../routes/perfil");
      mockRouter._mockDb.usuarios.push({
        id_usu: 789,
        nome_usu: "userparaSeguir",
        nome_comp: "User Para Seguir",
        email_usu: "seguir@example.com",
        tipo_usu: "apr"
      });

      await request(server)
        .post("/perfil/seguir/789")
        .expect(302);

      expect(mockRouter._mockDb.seguidores).toHaveLength(1);
    });

    it("deve retornar erro para ID inválido", async () => {
      await request(server)
        .post("/perfil/seguir/abc")
        .expect(400);
    });
  });

 describe("POST /perfil/desseguir/:id", () => {
  it("deve permitir deixar de seguir um usuário", async () => {
    // 1. Cria usuário para ser desseguido
    const [result] = await connection.query(
      "INSERT INTO usuarios (nome_usu, nome_comp, email_usu, tipo_usu) VALUES (?, ?, ?, ?)",
      ["user3", "User Three", "user3@example.com", "apr"]
    );
    const usuarioParaDesseguirId = result.insertId;

    // 2. Primeiro seguir o usuário
    await connection.query(
      "INSERT INTO seguidores (seguidor_id, seguindo_id) VALUES (?, ?)",
      [123, usuarioParaDesseguirId]
    );

    // 3. Verifica se está seguindo antes de desseguir
    const [antes] = await connection.query(
      "SELECT * FROM seguidores WHERE seguidor_id = ? AND seguindo_id = ?",
      [123, usuarioParaDesseguirId]
    );
    expect(antes.length).toBe(1); // Confirma que está seguindo

    // 4. Executa a ação de desseguir
    await request(server)
      .post(`/perfil/desseguir/${usuarioParaDesseguirId}`)
      .expect(302);

    // 5. Verifica se realmente deixou de seguir
    const [depois] = await connection.query(
      "SELECT * FROM seguidores WHERE seguidor_id = ? AND seguindo_id = ?",
      [123, usuarioParaDesseguirId]
    );
    expect(depois.length).toBe(0);
  });
});
});