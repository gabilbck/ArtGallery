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
const { logger } = require('../../logger'); // Adiciona o logger

router.get("/", async (req, res) => {
  validarPermissaoAdm(req, res);
  logger.info(`[ADM_OBRAS] Administrador acessou lista de todas as obras | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
  const obra = await listarTodasObra();
  const menssagem = req.query.menssagem || null;
  if (obra < 1) {
    conteudoNulo = "Não há registros para este filtro.";
    logger.info(`[ADM_OBRAS] Nenhuma obra encontrada | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
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
  validarPermissaoAdm(req, res);
  logger.info(`[ADM_OBRAS] Administrador acessou edição de obra | ObraID: ${req.params.id_obr} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
  // Implemente a lógica de edição conforme necessário
});

router.get("/excluir/:id_obr", async (req, res) => {
  validarPermissaoAdm(req, res);
  const id_obr = req.params.id_obr;
  try {
    await buscarUmaObraAdm(id_obr);
    await excluirUmaObraAdm(id_obr);
    logger.info(`[ADM_OBRAS] Obra excluída com sucesso | ObraID: ${id_obr} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
    res.redirect("/adm/obras/?menssagem=atualizado");
  } catch (error) {
    logger.error(`[ADM_OBRAS] Erro ao excluir obra | ObraID: ${id_obr} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip} | Erro: ${error.message}`);
    res.redirect("/adm/obras/?menssagem=erro");
  }
});

router.get("/favoritos", async (req, res) => {
  validarPermissaoAdm(req, res);
  logger.info(`[ADM_OBRAS] Administrador acessou lista de favoritos | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
  const favorito = await listarTodosFavorito();
  const menssagem = req.query.menssagem || null;
  if (favorito < 1) {
    conteudoNulo = "Não há registros para este filtro.";
    logger.info(`[ADM_OBRAS] Nenhum favorito encontrado | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
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
  logger.info(`[ADM_OBRAS] Administrador acessou lista de comentários | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
  const favorito = await listarTodosComentario();
  const menssagem = req.query.menssagem || null;
  if (favorito < 1) {
    conteudoNulo = "Não há registros para este filtro.";
    logger.info(`[ADM_OBRAS] Nenhum comentário encontrado | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
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
  validarPermissaoAdm(req, res);
  logger.info(`[ADM_OBRAS] Administrador acessou lista de coleções | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
  // Implemente a lógica de coleções conforme necessário
});

router.get("/categorias", async (req, res) => {
  if (!req.session.usuario) {
    logger.warn(`[ADM_OBRAS] Tentativa de acesso à categorias sem login | IP: ${req.ip}`);
    return res.redirect("/login");
  }
  const tipo_usu = req.session.usuario.tipo_usu;
  if (tipo_usu !== "adm") {
    logger.warn(`[ADM_OBRAS] Tentativa de acesso à categorias sem permissão de administrador | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
    return res.redirect("/");
  }
  logger.info(`[ADM_OBRAS] Administrador acessou lista de categorias | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
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
    logger.error(`[ADM_OBRAS] Erro ao buscar categorias | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip} | Erro: ${err.message}`);
    res.status(500).send("Erro ao carregar categorias");
  }
});

const { editarCategoria, buscarUmaCategoria } = require("../../banco");

// Página de edição
router.get("/categorias/editar/:id", async (req, res) => {
  validarPermissaoAdm(req, res);
  logger.info(`[ADM_OBRAS] Administrador acessou edição de categoria | CategoriaID: ${req.params.id} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
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
      logger.info(`[ADM_OBRAS] Foto da categoria atualizada | CategoriaID: ${id} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
    }
    const dados = {
      categoria: req.body.categoria,
      descricao: req.body.descricao,
      foto: fotoPath
    };
    await editarCategoria(id, dados);
    logger.info(`[ADM_OBRAS] Categoria editada com sucesso | CategoriaID: ${id} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
    res.redirect(`/adm/obras/categorias`);
  } catch (erro) {
    logger.error(`[ADM_OBRAS] Erro ao editar categoria | CategoriaID: ${req.params.id} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip} | Erro: ${erro.message}`);
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
  const id_cat = req.params.id_cat;
  try {
    await buscarUmaCategoriaAdm(id_cat);
    await excluirUmaCategoriaAdm(id_cat);
    logger.info(`[ADM_OBRAS] Categoria excluída com sucesso | CategoriaID: ${id_cat} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
    res.redirect("/adm/obras/categorias/?menssagem=atualizado");
  } catch (error) {
    logger.error(`[ADM_OBRAS] Erro ao excluir categoria | CategoriaID: ${id_cat} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip} | Erro: ${error.message}`);
    res.redirect("/adm/obras/?menssagem=erro");
  }
});

module.exports = router;
