// routes/index.js
const express = require("express");
const router = express.Router();
const {
  listarTodasObra,
  listarTodosFavorito,
  buscarTodasCategorias,
  buscarUmaObraAdm,
  excluirUmaObraAdm,
  buscarUmaCategoriaAdm,
  excluirUmaCategoriaAdm
} = require("../../banco");
const { validarPermissaoAdm } = require("../../middlewares/adm");
const { uploadCategoria } = require("../../utils/upload");

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
    title: "Obras - ArtGallery",
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

router.get("/favoritos", async (req, res) => {
  validarPermissaoAdm(req, res);
  const favorito = await listarTodosFavorito();
  const menssagem = req.query.menssagem || null;
  if (favorito < 1) {
    conteudoNulo = "Não há registros para este filtro.";
  } else {
    conteudoNulo = null;
  }
  res.render("_adm/_favoritos", {
    usuario: req.session.usuario,
    title: "Favoritos - ArtGallery",
    menssagem,
    favorito: favorito.map((f) => ({
      id_usu: f.id_usu,
      nome: f.nome,
      id_obr: f.id_obr,
      titulo: f.titulo,
      ativo: f.ativo,
      tabela: "obra",
    })),
  });
});

router.get("/comentarios", async (req, res) => {
  validarPermissaoAdm(req, res);
  const favorito = await listarTodosComentario();
  const menssagem = req.query.menssagem || null;
  if (favorito < 1) {
    conteudoNulo = "Não há registros para este filtro.";
  } else {
    conteudoNulo = null;
  }
  res.render("_adm/_favoritos", {
    usuario: req.session.usuario,
    title: "Favoritos - ArtGallery",
    menssagem,
    favorito: favorito.map((f) => ({
      id_usu: f.id_usu,
      nome: f.nome,
      id_obr: f.id_obr,
      titulo: f.titulo,
      ativo: f.ativo,
      tabela: "obra",
    })),
  });
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

const { editarCategoria, buscarUmaCategoria } = require("../../banco");

// Página de edição
router.get("/categorias/editar/:id", async (req, res) => {
  validarPermissaoAdm(req, res);
  const id = req.params.id;
  const categoria = await buscarUmaCategoria(id);
  res.render("_adm/_edicaoCategoria", {
    usuario: req.session.usuario,
    title: "Administração - Editar Categoria - ArtGallery",
    menssagem: null,
    dados: categoria,
    edicao: true,
    id_cat: id
  });
});

// Envio da edição
router.post("/categorias/editar/:id", uploadCategoria.single("foto"), async (req, res) => {
  validarPermissaoAdm(req, res);
  try {
    const id = req.params.id;
    let fotoPath = null;
    if (req.file) {
      fotoPath = "/uploads/categorias/" + req.file.filename;
    }
    const dados = {
      categoria: req.body.categoria,
      descricao: req.body.descricao,
      foto: fotoPath
    };
    await editarCategoria(id, dados);
    res.redirect(`/adm/obras/categorias`);
  } catch (erro) {
    console.error('Erro ao editar categoria:', erro);
    res.render('_adm/_edicaoCategoriaS', {
      usuario: req.session.usuario,
      title: "Administração - Editar Categoria - ArtGallery",
      menssagem: "erro",
      dados: req.body,
      edicao: true,
      id_cat: req.params.id
    });
  }
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
