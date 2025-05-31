const express = require("express");
const { inserirSuporte, buscarSuporte } = require("../banco");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("suporte", {
        title: "Suporte - ArtGallery",
        erros: null,
        sucesso: false
    });
});

router.post("/", async (req, res) => {
    const email_sup = req.body.email;
    const assunto_sup = req.body.assunto;
    const descricao_sup = req.body.descricao;

    let erros = null;

    if (!email_sup || !assunto_sup || !descricao_sup) {
        erros = "Todos os campos são obrigatórios!";
        return res.render("suporte", { title: "Suporte - ArtGallery", erros, sucesso: false });
    }

    try {
        await inserirSuporte(email_sup, assunto_sup, descricao_sup);
        const confirmar = await buscarSuporte(email_sup, assunto_sup, descricao_sup);
        if (!confirmar) {
            erros = "Erro ao registrar o suporte. Tente novamente.";
            console.log("Reporte Não Enviado");
            return res.render("suporte", { title: "Suporte - ArtGallery", erros, sucesso: false });   
        } else {
            console.log("Reporte Enviado");
            return res.render("suporte", { title: "Suporte - ArtGallery", erros: null, sucesso: true });
        }
    } catch (error) {
        console.error("Erro ao inserir suporte:", error);
        return res.render("suporte", { title: "Suporte - ArtGallery", erros: "Erro no servidor, tente novamente.", sucesso: false });
    }
});

module.exports = router;