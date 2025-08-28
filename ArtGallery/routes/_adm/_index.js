// routes/index.js
const express = require("express");
const router = express.Router();
const { logger } = require('../../logger'); // Adiciona o logger
const {
    buscarQtdApreciadores,
    buscarQtdArtistas,
    buscarQtdArtistasAguardandoLiberacao,
    buscarQtdArtistasLiberados,
    buscarQtdAdm,
    buscarQtdBan,
    buscarQtdFavoritos,
    buscarQtdComentarios,
    buscarQtdColecoes,
    buscarQtdCategorias,
    buscarQtdObras,
    buscarTotalUsuarios,
    buscarTotalPendenteSup,
    buscarTotalEmAndamentoSup,
    buscarTotalConcluidoSup,
    buscarTotalSup,
} = require("../../banco");

router.get("/", async (req, res) => {
    if (!req.session.usuario) {
        logger.warn(`[ADM_INDEX] Tentativa de acesso ao painel administrativo sem login | IP: ${req.ip}`);
        return res.redirect("/login");
    }
    const tipo_usu = req.session.usuario.tipo_usu;
    if (tipo_usu !== "adm") {
        logger.warn(`[ADM_INDEX] Tentativa de acesso ao painel administrativo sem permissão | UsuarioID: ${req.session.usuario.id_usu} | Tipo: ${tipo_usu} | IP: ${req.ip}`);
        return res.redirect("/");
    }

    logger.info(`[ADM_INDEX] Administrador acessou painel administrativo | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);

    try {
        const qtdApreciadores = await buscarQtdApreciadores();
        const qtdArtistas = await buscarQtdArtistas();
        const qtdArtistasAguardandoLiberacao = await buscarQtdArtistasAguardandoLiberacao();
        const qtdArtistasLiberados = await buscarQtdArtistasLiberados();
        const qtdAdm = await buscarQtdAdm();
        const qtdBan = await buscarQtdBan();
        const qtdFavoritos= await buscarQtdFavoritos();
        const qtdComentarios= await buscarQtdComentarios();
        const qtdColecoes= await buscarQtdColecoes();
        const qtdCategorias= await buscarQtdCategorias();
        const qtdObras = await buscarQtdObras();
        const totalUsuarios = await buscarTotalUsuarios();
        const pendenteSup = await buscarTotalPendenteSup();
        const emAndamentoSup = await buscarTotalEmAndamentoSup();
        const concluidoSup = await buscarTotalConcluidoSup();
        const todosSup = await buscarTotalSup();

        logger.info(`[ADM_INDEX] Dados carregados para painel administrativo | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);

        res.render("_adm/_index", {
            usuario: req.session.usuario,
            title: "Administração - ArtGallery",
            qtdApreciadores,
            qtdArtistas,
            qtdArtistasAguardandoLiberacao,
            qtdArtistasLiberados,
            qtdAdm,
            qtdBan,
            totalUsuarios,
            qtdObras,
            qtdFavoritos,
            qtdComentarios,
            qtdColecoes,
            qtdCategorias,
            pendenteSup,
            emAndamentoSup,
            concluidoSup,
            todosSup
        });
    } catch (err) {
        logger.error(`[ADM_INDEX] Erro ao carregar painel administrativo | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip} | Erro: ${err.message}`);
        res.status(500).send("Erro ao carregar painel administrativo");
    }
});

module.exports = router;