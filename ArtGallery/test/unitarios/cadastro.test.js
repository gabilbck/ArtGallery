// Testeconst request = require('supertest');
const request = require("supertest");
const express = require("express");
const session = require("express-session");
const cadastroRouter = require("../../routes/cadastro");
 
describe('Testes de Cadastro de Usuário (Artista ou Apreciador)', () => {
    let app;

  beforeEach(() => {
    app = express();
    app.use(express.urlencoded({ extended: false }));
    app.use(session({ secret: "teste", resave: false, saveUninitialized: true }));
    app.set("view engine", "ejs");
    app.set("views", __dirname + "/../views");
    app.use((req, res, next) => {
      res.render = (view, options) => res.json({ view, options });
      next();
    });
    app.use("/suporte", cadastroRouter);
  });
 
    test('Deve cadastrar um novo usuário com sucesso', async () => {
        const novoUsuario = {
            nome: 'João Silva',
            email: 'joao@email.com',
            senha: '123456',
            tipo: 'artista'  // ou 'apreciador'
        };
 
        const res = await request(app)
            .post('/cadastro')
            .send(novoUsuario)
            .set('Accept', 'application/json');
 
        expect(res.statusCode).toBe(201);
        expect(res.body.mensagem).toBe('Usuário cadastrado com sucesso');
    });
 
    test('Não deve cadastrar usuário com dados incompletos', async () => {
        const novoUsuario = {
            nome: 'Maria',
            email: '',  // Faltando email
            senha: '123456',
            tipo: 'apreciador'
        };
 
        const res = await request(app)
            .post('/cadastro')
            .send(novoUsuario)
            .set('Accept', 'application/json');
 
        expect(res.statusCode).toBe(400);
        expect(res.body.erro).toBe('Dados incompletos');
    });
 
    test('Deve retornar erro quando e-mail ou senha não são fornecidos', async () => {
        const res = await request(app)
            .post('/login')
            .send({}); // Envia vazio de propósito para simular erro
 
        expect(res.text).toContain("E-mail e senha são obrigatórios!");
    });
 
});