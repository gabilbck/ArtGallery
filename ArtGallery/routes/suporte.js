const express = require("express");
const { inserirSuporte } = require("../banco");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("suporte", {
        title: "Suporte - ArtGallery",
        erros: null,
        sucesso: false
    });
});

router.post("/", async (req, res) => {
    const { email, assunto, descricao } = req.body;
    let erros = null;

    if (!email || !assunto || !descricao) {
        erros = "Todos os campos são obrigatórios!";
        return res.render("suporte", { title: "Suporte - ArtGallery", erros, sucesso: false });
    }

    try {
        const reporte = await inserirSuporte({ email, assunto, descricao });
        if (!reporte) {
            erros = "Erro ao registrar o suporte. Tente novamente.";
            return res.render("suporte", { title: "Suporte - ArtGallery", erros, sucesso: false });
        } else {
            return res.render("suporte", { title: "Suporte - ArtGallery", erros: null, sucesso: true });
        }
    } catch (error) {
        console.error("Erro ao inserir suporte:", error);
        return res.render("suporte", { title: "Suporte - ArtGallery", erros: "Erro no servidor, tente novamente.", sucesso: false });
    }
});

module.exports = router;