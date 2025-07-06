const express = require("express");
const router = express.Router();
const {
    listarTodosSup,
    listarPendenteSup,
    listarEmAndamentoSup,
    listarConcluidoSup,
    buscarSuportePorId,
    mudarStatusSup,
} = require("../../banco");
const { validarPermissaoAdm } = require("../../middlewares/adm")

router.get("/", async (req, res) => {
    validarPermissaoAdm(req, res);
    const suporte = await listarTodosSup();
    const menssagem = req.query.menssagem || null;
    if (suporte < 1){ conteudoNulo = "Não há registros para este filtro." } else { conteudoNulo = null };
    res.render("_adm/_suporte", {
        usuario: req.session.usuario,
        title: "Suporte - ArtGallery",
        menssagem,
        suporte: suporte.map((s) => ({
            id: s.id,
            email: s.email,
            assunto: s.assunto,
            descricao: s.descricao,
            status: s.status,
            tabela: "suporte",
        })),
    });
});

router.get("/pendente", async (req, res) => {
    validarPermissaoAdm(req, res);
    const suporte = await listarPendenteSup();
    const menssagem = req.query.menssagem || null;
    if (suporte < 1){ conteudoNulo = "Não há registros para este filtro." } else { conteudoNulo = null };
    res.render("_adm/_suporte", {
        usuario: req.session.usuario,
        title: "Suporte - ArtGallery",
        menssagem,
        suporte: suporte.map((s) => ({
            id: s.id,
            email: s.email,
            assunto: s.assunto,
            descricao: s.descricao,
            status: s.status,
            tabela: "suporte",
        })),
    });
});

router.get("/emAndamento", async (req, res) => {
    validarPermissaoAdm(req, res);
    const suporte = await listarEmAndamentoSup();
    const menssagem = req.query.menssagem || null;
    if (suporte < 1){ conteudoNulo = "Não há registros para este filtro." } else { conteudoNulo = null };
    res.render("_adm/_suporte", {
        usuario: req.session.usuario,
        title: "Suporte - ArtGallery",
        menssagem,
        suporte: suporte.map((s) => ({
            id: s.id,
            email: s.email,
            assunto: s.assunto,
            descricao: s.descricao,
            status: s.status,
            tabela: "suporte",
        })),
    });
});

router.get("/concluido", async (req, res) => {
    validarPermissaoAdm(req, res);
    const suporte = await listarConcluidoSup();
    if (suporte < 1){ conteudoNulo = "Não há registros para este filtro." } else { conteudoNulo = null };
    res.render("_adm/_suporte", {
        usuario: req.session.usuario,
        title: "Suporte - ArtGallery",
        conteudoNulo, 
        menssagem: null,
        suporte: suporte.map((s) => ({
            id: s.id,
            email: s.email,
            assunto: s.assunto,
            descricao: s.descricao,
            status: s.status,
            tabela: "suporte",
        })),
    });
});

router.get("/status/:id/:status", async (req, res) => {
    validarPermissaoAdm(req, res);
    const id_sup = req.params.id;
    const status_sup = req.params.status;
    try {
        await mudarStatusSup(id_sup, status_sup);
        res.redirect("/adm/suporte/?menssagem=atualizado");
    } catch (error) {
        console.error("Erro ao mudar status:", error.message);
        res.redirect("/adm/suporte/?menssagem=erro");
    }
});

module.exports = router;