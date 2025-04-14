const express = require("express");
const router = express.Router();
const { buscarUsuario } = require("../banco");

// GET /login — permite acesso somente se o usuário não estiver logado
router.get("/", (req, res) => {
    if (req.session.usuario) {
        return res.redirect("/");
    }

    res.render("login", {
        title: "Login - ArtGallery",
        erros: null,
        sucesso: false
    });
});

// POST /login — realiza a autenticação e exibe mensagem de sucesso se válido
router.post("/", async (req, res) => {
    const { email, senha } = req.body;
    let erros = null;

    if (!email || !senha) {
        erros = "E-mail e senha são obrigatórios!";
        return res.render("login", { title: "Login - ArtGallery", erros, sucesso: false });
    }

    try {
        const usuario = await buscarUsuario({ email, senha });

        if (usuario) {
            req.session.usuario = usuario;
            // Renderiza o login com a flag sucesso ativada
            return res.render("login", { title: "Login - ArtGallery", erros: null, sucesso: true });
        } else {
            return res.render("login", {
                title: "Login - ArtGallery",
                erros: "E-mail ou senha incorretos.",
                sucesso: false
            });
        }
    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        return res.render("login", {
            title: "Login - ArtGallery",
            erros: "Erro no servidor, tente novamente.",
            sucesso: false
        });
    }
});

module.exports = router;