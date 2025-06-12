const express = require("express");
const router = express.Router();
const { 
    buscarColecaoPorUsu,
    criarColecao,
    excluirColecao
} = require("../banco");

// Página principal redireciona para as coleções do usuário logado
router.get("/", async (req, res) => {
    if (!req.session.usuario) {
        return res.redirect("/login");
    }
    const id_usu = req.session.usuario.id_usu;
    res.redirect(`/colecao/${id_usu}`);
});

// Página que exibe as coleções do usuário
router.get("/:id_usu", async (req, res) => {
    if (!req.session.usuario) {
        return res.redirect("/login");
    }

    const id_usu = req.session.usuario.id_usu;
    const nome_usu = req.session.usuario.nome_usu;

    try {
        const colecoes = await buscarColecaoPorUsu(id_usu);

        if (!colecoes || colecoes.length === 0) {
            return res.redirect("/colecao/criar");
        }

        const erros = req.session.erro || null;
        const sucesso = req.session.sucesso || null;
        delete req.session.erro;
        delete req.session.sucesso;

        res.render("colecoes", {
            colecoes,
            id_usu,
            nome_usu,
            title: `Coleções de ${nome_usu}`,
            erros,
            sucesso
        });

    } catch (err) {
        console.error("Erro ao buscar coleções:", err);
        res.status(500).send("Erro ao buscar coleções");
    }
});

// Rota GET → mostra o formulário de criação de coleção
router.get("/criar", (req, res) => {
    if (!req.session.usuario) {
        return res.redirect("/login");
    }

    res.render("criarColecao", {
        nome_usu: req.session.usuario.nome_usu,
        title: "Criar nova coleção"
    });
});

// Rota POST → recebe os dados do formulário e cria a coleção
router.post("/criar", async (req, res) => {
    if (!req.session.usuario) {
        return res.redirect("/login");
    }

    const id_usu = req.session.usuario.id_usu;
    const nome_col = req.body.nome_col;

    if (!nome_col || nome_col.trim().length === 0) {
        req.session.erro = "Nome da coleção não pode ser vazio.";
        return res.redirect("/colecao/criar");
    }

    try {
        await criarColecao(id_usu, nome_col.trim());
        req.session.sucesso = "Coleção criada com sucesso!";
        res.redirect(`/colecao/${id_usu}`);
    } catch (err) {
        console.error("Erro ao criar coleção:", err);
        req.session.erro = "Erro ao criar coleção.";
        res.redirect("/colecao/criar");
    }
});

module.exports = router;