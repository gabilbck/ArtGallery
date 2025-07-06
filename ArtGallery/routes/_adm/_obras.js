// routes/index.js
const express = require("express");
const router = express.Router();
const {
  listarTodasObra,
  buscarTodasCategorias,
  buscarUmaObraAdm,
  excluirUmaObraAdm,
  buscarUmaCategoriaAdm,
  excluirUmaCategoriaAdm
} = require("../../banco");
const { validarPermissaoAdm } = require("../../middlewares/adm");

router.get("/", async (req, res) => {
  validarPermissaoAdm(req, res);
  const obra = await listarTodasObra();
  const menssagem = req.query.menssagem || null;
  if (obra < 1) {
    conteudoNulo = "Não há registros para este filtro.";
  } else {
    conteudoNulo = null;
  }
  res.render("_adm/_obras", {
    usuario: req.session.usuario,
    title: "Suporte - ArtGallery",
    menssagem,
    obra: obra.map((o) => ({
      id: o.id,
      titulo: o.titulo,
      descricao: o.descricao,
      ativo: o.ativo,
      idCat: o.idCat,
      idArt: o.idArt,
      tabela: "obra",
    })),
  });
});

router.get("/editar/:id_obr", async (req, res) => {
  // validarPermissaoAdm(req, res);
  // const id_obr = req.params.id;
  // const dados = await buscarUmaObraAdm(id_obr);
  // const editar = await editarObra(id_obr);
});

router.get("/excluir/:id_obr", async (req, res) => {
  validarPermissaoAdm(req, res);
  const id_obr = req.params.id_obr
  try {
    await buscarUmaObraAdm(id_obr);
    await excluirUmaObraAdm(id_obr);
    res.redirect("/adm/obras/?menssagem=atualizado");
  } catch (error) {
    console.error("Erro ao excluir obra:", error.message);
    res.redirect("/adm/obras/?menssagem=erro");
  }
});

router.get("/favoritos", async (req, res) => {});

router.get("/comentarios", async (req, res) => {
  
});

router.get("/colecoes", async (req, res) => {

});

router.get("/categorias", async (req, res) => {
  if (!req.session.usuario) return res.redirect("/login");
  const tipo_usu = req.session.usuario.tipo_usu;
  if (tipo_usu !== "adm") return res.redirect("/");
  const categorias = await buscarTodasCategorias();
  try {
    res.render("_adm/_categorias", {
      usuario: req.session.usuario,
      title: "Administração - Categorias - ArtGallery",
      categorias: categorias.map((c) => ({
        id: c.id,
        nome: c.nome,
        descricao: c.descricao,
        foto: c.foto,
        tabela: "categoria",
      })),
    });
  } catch (err) {
    console.error("Erro ao buscar categorias:", err);
    res.status(500).send("Erro ao carregar categorias");
  }
});

router.get("/categorias/editar/:id_cat", async (req, res) => {
  // validarPermissaoAdm(req, res);
  // const id_cat = req.params.id_cat;
  // const dados = await buscarUmaObraAdm(id_cat);
  // const editar = await editarObra(id_cat);
});

router.get("/categorias/excluir/:id_cat", async (req, res) => {
  validarPermissaoAdm(req, res);
  const id_cat = req.params.id_cat
  try {
    await buscarUmaCategoriaAdm(id_cat);
    await excluirUmaCategoriaAdm(id_cat);
    res.redirect("/adm/obras/categorias/?menssagem=atualizado");
  } catch (error) {
    console.error("Erro ao excluir categoria:", error.message);
    res.redirect("/adm/obras/?menssagem=erro");
  }
});

module.exports = router;
