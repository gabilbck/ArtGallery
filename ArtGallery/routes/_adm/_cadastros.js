const express = require("express");
const router = express.Router();
const { validarPermissaoAdm } = require("../../middlewares/adm");
const { uploadObra, uploadPerfil, uploadCategoria } = require("../../utils/upload");
const {
    registrarCategoria,
    buscarIdUltimaCategoria,
    registrarArtista
} = require("../../banco");
const { logger } = require('../../logger'); // Adiciona o logger

router.get("/", async (req, res) => {
    logger.info(`[ADM_CADASTROS] Redirecionamento para página inicial de administração | IP: ${req.ip}`);
    res.redirect(`/_adm/_index`);
});

router.get("/categoria", async (req, res) => {
  validarPermissaoAdm(req, res);
  logger.info(`[ADM_CADASTROS] Administrador acessou cadastro de categoria | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
  res.render("_adm/_cadastroCategoria", {
    usuario: req.session.usuario,
    title: "Administração - Cadastro de Categorias - ArtGallery",
    menssagem: null,
    dados: {},
    });
});

router.post("/categoria", uploadCategoria.single("foto"), async (req, res) => {
    validarPermissaoAdm(req, res);
    try{
        let fotoPath = null;
        if (req.file) {
            fotoPath = "/uploads/categorias/" + req.file.filename;
            logger.info(`[ADM_CADASTROS] Foto de categoria enviada | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
        }
        const dados = {
            categoria: req.body.categoria,
            descricao: req.body.descricao,
            foto: fotoPath,
        };
        await registrarCategoria(dados);
        logger.info(`[ADM_CADASTROS] Categoria cadastrada com sucesso | Categoria: ${req.body.categoria} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
        res.redirect(`/adm/obras/categorias`);
    } catch (erro) {
        logger.error(`[ADM_CADASTROS] Erro ao cadastrar categoria | Categoria: ${req.body.categoria} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip} | Erro: ${erro.message}`);
        res.render('_adm/_cadastroCategoria', {
            usuario: req.session.usuario,
            title: "Administração - Cadastro de Categorias - ArtGallery",
            menssagem: "erro",
            dados: req.body
        });
    }
});

router.get("/artista", async (req, res) => {
    validarPermissaoAdm(req, res);
    logger.info(`[ADM_CADASTROS] Administrador acessou cadastro de artista | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
    res.render("_adm/_cadastroArtista", {
        usuario: req.session.usuario,
        title: "Administração - Cadastro de Artista - ArtGallery",
        menssagem: null,
        dados: {},
    });
})

router.post("/artista", uploadPerfil.single("foto"), async (req, res) => {
    validarPermissaoAdm(req, res);
    try{
        let fotoPath = null;
        if (req.file) {
            fotoPath = "/uploads/fotos-perfil/" + req.file.filename;
            logger.info(`[ADM_CADASTROS] Foto de artista enviada | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
        }
        const dados = {
            nome_comp: req.body.nome_comp,
            nome_usu: req.body.nome_usu,
            bio_art: req.body.bio_Art,
            foto: fotoPath, 
        };
        await registrarArtista(dados);
        logger.info(`[ADM_CADASTROS] Artista cadastrado com sucesso | Nome: ${req.body.nome_usu} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
        res.redirect(`/adm/usuarios/artistas/ativos`);
    } catch (erro) {
        logger.error(`[ADM_CADASTROS] Erro ao cadastrar artista | Nome: ${req.body.nome_usu} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip} | Erro: ${erro.message}`);
        res.render('_adm/_usuariosTotal', {
            usuario: req.session.usuario,
            title: "Administração - Cadastro de Artistas - ArtGallery",
            menssagem: "erro",
            dados: req.body
        });
    }
});

module.exports = router;
