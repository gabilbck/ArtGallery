const express = require("express");
const router = express.Router();
const { validarPermissaoAdm } = require("../../middlewares/adm");
const { uploadObra, uploadPerfil, uploadCategoria } = require("../../utils/upload");
const {
    registrarCategoria,
    buscarIdUltimaCategoria,
    registrarArtista
} = require("../../banco");

router.get("/", async (req, res) => {
    res.redirect(`/_adm/_index`);
});

router.get("/categoria", async (req, res) => {
  validarPermissaoAdm(req, res);
  res.render("_adm/_cadastroCategoria", {
    usuario: req.session.usuario,
    title: "Administração - Cadastro de Categorias - ArtGallery",
    menssagem: null,
    dados: {}, // <-- Adicionado aqui
    });
});

router.post("/categoria", uploadCategoria.single("foto"), async (req, res) => {
    validarPermissaoAdm(req, res);
    try{
        let fotoPath = null;
        if (req.file) {
            fotoPath = "/uploads/categorias/" + req.file.filename;
        }
        const dados = {
            categoria: req.body.categoria,
            descricao: req.body.descricao,
            foto: fotoPath, // agora está correto
        };
        await registrarCategoria(dados);
        res.redirect(`/adm/obras/categorias`);
    } catch (erro) {
        console.error('Erro ao cadastrar categoria:', erro);
        res.render('_adm/_cadastroCategoria', {
            usuario: req.session.usuario,
            title: "Administração - Cadastro de Categorias - ArtGallery",
            menssagem: "erro",
            dados: req.body // reutiliza os dados que o usuário enviou
        });
    }
});

router.get("/artista", async (req, res) => {
    validarPermissaoAdm(req, res);
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
        }
        const dados = {
            nome_comp: req.body.nome_comp,
            nome_usu: req.body.nome_usu,
            bio_art: req.body.bio_Art,
            foto: fotoPath, 
        };
        await registrarArtista(dados);
        res.redirect(`/adm/usuarios/artistas/ativos`);
    } catch (erro) {
        console.error('Erro ao cadastrar categoria:', erro);
        res.render('_adm/_usuariosTotal', {
            usuario: req.session.usuario,
            title: "Administração - Cadastro de Artistas - ArtGallery",
            menssagem: "erro",
            dados: req.body // reutiliza os dados que o usuário enviou
        });
    }
});

module.exports = router;
