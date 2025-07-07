const express = require("express");
const router = express.Router();
const { validarPermissaoAdm } = require("../../middlewares/adm");
const { uploadObra, uploadPerfil, uploadCategoria } = require("../../utils/upload");
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
        const id_cat = await buscarIdUltimaCategoria();
        res.redirect(`/categorias/${id_cat}`);
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

module.exports = router;
