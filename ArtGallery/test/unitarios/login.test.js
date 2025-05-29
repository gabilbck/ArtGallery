const request = require("supertest");
const express = require("express");
const session = require("express-session");
const loginRouter = require("../../routes/login");
const banco = require("../../banco");

jest.mock("../../banco", () => ({
    buscarUsuario: jest.fn(),
    conectarBD: jest.fn(), // prevenindo conexão real
}));

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: "teste", resave: false, saveUninitialized: true }));
app.set("view engine", "ejs"); // ajuste se estiver usando outro template
app.use("/login", loginRouter);

describe("POST /login (unitário)", () => {
    beforeEach(() => {
        banco.conectarBD.mockImplementation(() => {
            throw new Error("conectarBD não deve ser chamado em testes unitários");
        });
    });

    it("deve mostrar erro se email ou senha estiverem vazios", async () => {
        const res = await request(app).post("/login").send({ email: "", senha: "" });
        expect(res.text).toContain("E-mail e senha são obrigatórios!");
    });

    it("deve autenticar com sucesso se usuário for válido", async () => {
        banco.buscarUsuario.mockResolvedValue({ id_usu: 1, nome_usu: "Maria", email_usu: "maria@email.com" });

        const res = await request(app).post("/login").send({ email: "maria@email.com", senha: "123" });
        expect(res.text).toContain("sucesso"); // ajuste conforme seu EJS
    });

    it("deve mostrar erro se usuário for inválido", async () => {
        banco.buscarUsuario.mockResolvedValue(null);

        const res = await request(app).post("/login").send({ email: "naoexiste@email.com", senha: "errado" });
        expect(res.text).toContain("E-mail ou senha incorretos.");
    });

    it("deve mostrar erro de servidor se buscarUsuario falhar", async () => {
        banco.buscarUsuario.mockRejectedValue(new Error("falha"));

        const res = await request(app).post("/login").send({ email: "falha@email.com", senha: "123" });
        expect(res.text).toContain("Erro no servidor, tente novamente.");
    });
});