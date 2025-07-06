const express = require("express");
const router = express.Router();
const { validarPermissaoAdm } = require("../../middlewares/adm");
const {
    registrarCategoria,
    buscarIdUltimaCategoria,
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
  });
});

router.post("/categoria", async (req, res) => {
    validarPermissaoAdm(req, res);
    try{
        const dados = {
            categoria: req.body.categoria,
            descricao: req.body.descricao,
        };
        await registrarCategoria(dados);
        const id_cat = await buscarIdUltimaCategoria();
        res.redirect(`/categorias/${id_cat}`);
    } catch (erro) {
        console.error('Erro ao cadastrar categoria:', erro);
        res.render('_adm/_cadastroCategoria', {
            usuario: req.session.usuario,
            title: "Administração - Cadastro de Categorias - ArtGallery",
            menssagem: "erro",
        });
    }
    });

module.exports = router;
