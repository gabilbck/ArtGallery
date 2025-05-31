const request = require("supertest");
const express = require("express");
const session = require("express-session");
const loginRouter = require("../../routes/login");

jest.mock("../../banco", () => ({
  buscarUsuario: jest.fn()
}));

const { buscarUsuario } = require("../../banco");

describe("Rotas de /login", () => {
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
    app.use("/login", loginRouter);
  });

  it("deve redirecionar para / se já estiver logado", async () => {
    const agent = request.agent(app);
    const getSession = () =>
      new Promise((resolve) => {
        agent.get("/login").end(() => {
          agent.app.request.session = { usuario: { nome_usu: "Ana" } };
          resolve();
        });
      });

    await getSession();
    const res = await agent.get("/login");
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/");
  });

  it("deve renderizar a página de login se não estiver logado", async () => {
    const res = await request(app).get("/login");
    expect(res.status).toBe(200);
    expect(res.body.view).toBe("login");
    expect(res.body.options.erros).toBe(null);
    expect(res.body.options.sucesso).toBe(false);
  });

  it("deve validar ausência de email ou senha", async () => {
    const res = await request(app).post("/login").send({ email: "", senha: "" });
    expect(res.body.view).toBe("login");
    expect(res.body.options.erros).toBe("E-mail e senha são obrigatórios!");
  });

  it("deve falhar se o usuário não for encontrado", async () => {
    buscarUsuario.mockResolvedValue(null);
    const res = await request(app).post("/login").send({ email: "teste@email.com", senha: "123" });
    expect(res.body.options.erros).toBe("E-mail ou senha incorretos.");
    expect(res.body.options.sucesso).toBe(false);
  });

  it("deve logar com sucesso e criar sessão", async () => {
    buscarUsuario.mockResolvedValue({ id_usu: 1, nome_usu: "Ana", email_usu: "a@b.com", tipo_usu: "comum" });
    const res = await request(app).post("/login").send({ email: "a@b.com", senha: "123" });
    expect(res.body.options.sucesso).toBe(true);
    expect(res.body.options.erros).toBe(null);
  });

  it("deve lidar com erro de servidor", async () => {
    buscarUsuario.mockRejectedValue(new Error("Falha DB"));
    const res = await request(app).post("/login").send({ email: "a@b.com", senha: "123" });
    expect(res.body.options.erros).toBe("Erro no servidor, tente novamente.");
    expect(res.body.options.sucesso).toBe(false);
  });
});
