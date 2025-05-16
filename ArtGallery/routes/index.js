const express = require("express");
const router = express.Router();
const { buscarTodasCategorias } = require("../banco");

// Rota principal: exibe a página index, independentemente do usuário estar logado ou não
router.get("/", async (req, res) => {
    try {
        const categorias = await buscarTodasCategorias();
        res.render("index", {
            title: "Página Inicial - ArtGallery",
            usuario: req.session.usuario || null,
            categorias: categorias || [],
        });
    } catch (erro) {
        console.error("Erro ao buscar categorias:", erro);
        res.status(500).send("Erro ao carregar categorias");
    }
});

// Rota de logout: somente disponível para usuário logado
router.get("/logout", (req, res) => {
    if (req.session.usuario) {
        req.session.destroy(() => {
            res.redirect("/");
        });
    } else {
        res.redirect("/");
    }
});

module.exports = router;