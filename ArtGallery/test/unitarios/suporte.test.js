const request = require("supertest");
const express = require("express");
const session = require("express-session");
const suporteRouter = require("../../routes/suporte");

jest.mock("../../banco", () => ({
  inserirSuporte: jest.fn()
}));

const { inserirSuporte } = require("../../banco");

describe("Rotas de /suporte", () => {
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
    app.use("/suporte", suporteRouter);
  });

  it("deve renderizar a página de suporte com GET", async () => {
    const res = await request(app).get("/suporte");
    expect(res.status).toBe(200);
    expect(res.body.view).toBe("suporte");
    expect(res.body.options.sucesso).toBe(false);
    expect(res.body.options.erros).toBe(null);
  });

  it("deve validar campos obrigatórios com POST", async () => {
    const res = await request(app).post("/suporte").send({ email: "", assunto: "", descricao: "" });
    expect(res.status).toBe(200);
    expect(res.body.view).toBe("suporte");
    expect(res.body.options.sucesso).toBe(false);
    expect(res.body.options.erros).toBe("Todos os campos são obrigatórios!");
  });

  it("deve lidar com falha ao inserir suporte", async () => {
    inserirSuporte.mockResolvedValue(null);
    const res = await request(app).post("/suporte").send({ email: "a@b.com", assunto: "Bug", descricao: "Tela branca" });
    expect(res.status).toBe(200);
    expect(res.body.options.erros).toBe("Erro ao registrar o suporte. Tente novamente.");
  });

  it("deve lidar com erro de servidor ao inserir suporte", async () => {
    inserirSuporte.mockRejectedValue(new Error("DB FAIL"));
    const res = await request(app).post("/suporte").send({ email: "a@b.com", assunto: "Bug", descricao: "Tela branca" });
    expect(res.status).toBe(200);
    expect(res.body.options.erros).toBe("Erro no servidor, tente novamente.");
  });

  it("deve renderizar sucesso ao inserir suporte corretamente", async () => {
    inserirSuporte.mockResolvedValue({ id: 1 });
    const res = await request(app).post("/suporte").send({ email: "a@b.com", assunto: "Bug", descricao: "Tela branca" });
    expect(res.status).toBe(200);
    expect(res.body.options.sucesso).toBe(true);
    expect(res.body.options.erros).toBe(null);
  });
});
