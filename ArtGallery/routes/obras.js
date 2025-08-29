// routes/obras.js (ou onde preferir agrupar)
const express = require("express");
const router = express.Router();
const path = require("path");
const { uploadObra } = require("../utils/upload");
const { logger } = require('../logger'); //->impoirt o logger
const {
  jaFavoritou, // bool  -> usuário já marcou?
  favoritarObra, // void  -> grava favorito
  desfavoritarObra, // void  -> remove favorito
  contarFavoritos, // int   -> total atual
  buscarUmaObra,
  buscarComentariosPorObra,
  comentarObra,
  excluirComentario,
  buscarTodasCategorias,
  editarUmaObraAdm
} = require("../banco");
const { validarSessao } = require("../middlewares/adm");

router.get("/", async (req, res) => {
  if (!req.session.usuario) {
    logger.warn(`[OBRAS] Tentativa de acesso sem login | IP: ${req.ip}`);
    return res.redirect("/login");
  } else{
    logger.info(`[OBRAS] Usuário acessou /obras e foi redirecionado para /explorar | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
    return res.redirect("/explorar");
  }
});

const autenticado = (req, res, next) => {
  if (req.session && req.session.usuario) {
    next();
  } else {
    logger.warn(`[OBRAS] Tentativa de acesso sem login | IP: ${req.ip}`);
    res.redirect("/login");
  }
};

router.get("/nova", autenticado, async (req, res) => {
  try {
    validarSessao(req, res);
    const tipo = req.session.usuario.tipo_usu;
    logger.info(`[OBRAS] Usuário acessou página de nova obra | UsuarioID: ${req.session.usuario.id_usu} | Tipo: ${tipo} | IP: ${req.ip}`);
    if (tipo == "apr"){
      logger.warn(`[OBRAS] Usuário apreciador tentou acessar nova obra | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
      return res.redirect("/");
    } else {
      const [categorias] = await conexao.query("SELECT id_cat, nome_cat FROM categoria");
      if (tipo == "adm") {
        const [artistas] = await conexao.query("SELECT id_art, nome_comp as nome_art from artista;");
        logger.info(`[OBRAS] Admin acessou nova obra | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
        res.render("novaObra", {
          title: "Nova Obra",
          categorias: categorias.map(c => ({
            id_cat: c.id_cat,
            nome_cat: c.nome_cat,
            tabela: "categoria"
          })),
          artistas: artistas.map(a => ({
            id_art: a.id_art,
            nome_art: a.nome_art,
            tabela: "artista"
          })),
          tipo,
          usuario: req.session.usuario
        });
      } else{
        logger.info(`[OBRAS] Artista acessou nova obra | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
        res.render("novaObra", {
          title: "Nova Obra",
          categorias: categorias.map(c => ({
            id_cat: c.id_cat,
            nome_cat: c.nome_cat,
            tabela: "categoria"
          })),
          asrtistas: null,
          usuario: req.session.usuario
        });
      }
    }
  } catch (error) {
    logger.error(`[OBRAS] Erro ao carregar página de nova obra | UsuarioID: ${req.session.usuario?.id_usu} | IP: ${req.ip} | Erro: ${error.message}`);
    res.status(500).send("Erro ao carregar página de nova obra");
  }
});

// POST para salvar nova obra
router.post("/nova", uploadObra.single("imagem"), async (req, res) => {
  validarSessao(req, res);
  const tipo = req.session.usuario.tipo_usu;
  if (tipo == "apr"){
    logger.warn(`[OBRAS] Usuário apreciador tentou criar nova obra | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
    return res.redirect("/");
  } else {
    try {
      const { titulo, descricao, categoria, artista } = req.body;
      const caminhoImagem = "/uploads/obras/" + req.file.filename;
      logger.info(`[OBRAS] Tentativa de criar nova obra | UsuarioID: ${req.session.usuario.id_usu} | Título: ${titulo} | ArtistaID: ${artista} | IP: ${req.ip}`);
      const enviar = await banco.salvarNovaObra(titulo, descricao, categoria, caminhoImagem, artista);
      const obraNova = await banco.consultarUltimaObraArtista(artista);
      logger.info(`[OBRAS] Nova obra criada com sucesso | ObraID: ${obraNova.id_obr} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
      res.redirect(`/obras/${obraNova.id_obr}`);
    } catch (error) {
      logger.error(`[OBRAS] Erro ao salvar nova obra | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip} | Erro: ${error.message}`);
      res.status(500).send("Erro ao salvar nova obra.");
    }
  }
});

router.get("/editar/:id", async (req, res) => {
  if (!req.session.usuario) {
    logger.warn(`[OBRAS] Tentativa de acesso à edição sem login | IP: ${req.ip}`);
    return res.redirect("/login");
  }
  const id = req.params.id;
  const usuario = req.session.usuario;
  try {
    logger.info(`[OBRAS] Usuário acessou edição de obra | ObraID: ${id} | UsuarioID: ${usuario.id_usu} | IP: ${req.ip}`);
    const dados = await buscarUmaObra(id);

    if (usuario.tipo_usu !== "adm" && usuario.id_usu !== dados.id_usu_art) {
      logger.warn(`[OBRAS] Usuário sem permissão para editar obra | ObraID: ${id} | UsuarioID: ${usuario.id_usu} | IP: ${req.ip}`);
      return res.status(403).send("Você não tem permissão para editar esta obra.");
    }

    const categorias = (await buscarTodasCategorias()).map(c => ({
      id_cat: c.id,
      nome_cat: c.nome
    }));
    const [artistas] = await require("../banco").conectarBD().then(conn =>
      conn.query("SELECT id_art, nome_comp AS nome_art FROM artista")
    );

    res.render("edicaoObra", {
      title: "Editar Obra - ArtGallery",
      usuario,
      id_obr: id,
      dados: {
        titulo: dados.titulo,
        descricao: dados.des,
        foto: dados.foto,
        id_art: dados.id_art,
        id_cat: dados.idCat || dados.id_cat
      },
      categorias,
      artistas: artistas.map(a => ({
        id_art: a.id_art,
        nome_art: a.nome_art
      }))
    });
  } catch (err) {
    logger.error(`[OBRAS] Erro ao carregar edição de obra | ObraID: ${id} | UsuarioID: ${usuario.id_usu} | IP: ${req.ip} | Erro: ${err.message}`);
    res.redirect("/obras/" + id + "?menssagem=erro");
  }
});

router.post("/editar/:id", uploadObra.single("imagem"), async (req, res) => {
  if (!req.session.usuario) {
    logger.warn(`[OBRAS] Tentativa de edição sem login | IP: ${req.ip}`);
    return res.redirect("/login");
  }

  const id = req.params.id;
  const usuario = req.session.usuario;
  const { titulo, descricao, categoria, artista } = req.body;

  let fotoPath = null;
  if (req.file) {
    fotoPath = "/uploads/obras/" + req.file.filename;
    logger.info(`[OBRAS] Foto da obra atualizada | ObraID: ${id} | UsuarioID: ${usuario.id_usu} | IP: ${req.ip}`);
  }

  try {
    const obraAtual = await buscarUmaObra(id);

    if (usuario.tipo_usu !== "adm" && usuario.id_usu !== obraAtual.id_usu_art) {
      logger.warn(`[OBRAS] Usuário sem permissão para editar obra | ObraID: ${id} | UsuarioID: ${usuario.id_usu} | IP: ${req.ip}`);
      return res.status(403).send("Você não tem permissão para editar esta obra.");
    }

    const conexao = await require("../banco").conectarBD();

    const sql = `
      UPDATE obra SET
        titulo_obr = ?,
        descricao_obr = ?,
        ${fotoPath ? "foto_obr = ?," : ""}
        id_cat = ?,
        id_art = ?
      WHERE id_obr = ?
    `;

    const params = fotoPath
      ? [titulo, descricao, fotoPath, categoria, artista, id]
      : [titulo, descricao, categoria, artista, id];

    await conexao.query(sql, params);

    logger.info(`[OBRAS] Obra editada com sucesso | ObraID: ${id} | UsuarioID: ${usuario.id_usu} | IP: ${req.ip}`);
    res.redirect(`/obras/${id}`);
  } catch (erro) {
    logger.error(`[OBRAS] Erro ao salvar edição de obra | ObraID: ${id} | UsuarioID: ${usuario.id_usu} | IP: ${req.ip} | Erro: ${erro.message}`);
    res.status(500).send("Erro ao editar a obra.");
  }
});



router.get("/:id", async (req, res) => {
  if (!req.session.usuario) {
    logger.warn(`[OBRAS] Tentativa de acesso à obra sem login | IP: ${req.ip}`);
    return res.redirect("/login");
  }
  const obraId = req.params.id.includes("=")
    ? req.params.id.split("=")[1]
    : req.params.id;
  const usuario = req.session.usuario.id_usu;
  try {
    logger.info(`[OBRAS] Usuário acessou detalhes da obra | ObraID: ${obraId} | UsuarioID: ${usuario} | IP: ${req.ip}`);
    const obra = await buscarUmaObra(obraId);
    const jaFavoritouObra = await jaFavoritou(usuario, obraId);
    const comentarios = await buscarComentariosPorObra(obraId);

    if (!obra) {
      logger.warn(`[OBRAS] Obra não encontrada | ObraID: ${obraId} | UsuarioID: ${usuario} | IP: ${req.ip}`);
      return res.status(404).send("Obra não encontrada");
    }

    const erros = req.session.erro || null;
    const sucesso = req.session.sucesso || null;
    delete req.session.erro;
    delete req.session.sucesso;

    res.render("ObraID", { 
        obra: {
            id: obra.id, 
            titulo: obra.titulo,
            id_art: obra.id_art, 
            id_usu_art: obra.id_usu_art,
            artU: obra.artU,
            artC: obra.artC,
            foto: obra.foto, 
            des: obra.des, 
            qcom: obra.qcom,
            qfav: obra.qfav,
            tabela: "obra"
        },
        title: `Obra: ${obra.titulo} – ArtGallery`,
        jaFavoritou: jaFavoritouObra, 
        comentarios: comentarios.map(c => ({
            id_com: c.id_com,
            id_usu: c.id_usu,
            id_obr: c.id_obr,
            nome: c.nome,
            usu: c.usu,
            foto: c.foto,
            texto: c.texto,
            tabela: "comentario"
        })),
        usuario: req.session.usuario, 
        erros,
        sucesso
    });
  } catch (err) {
    logger.error(`[OBRAS] Erro ao carregar detalhes da obra | ObraID: ${obraId} | UsuarioID: ${usuario} | IP: ${req.ip} | Erro: ${err.message}`);
    res.status(500).send("Erro ao carregar detalhes da obra");
  }
});

router.get("/:id/favoritar", async (req, res) => {
  if (!req.session.usuario) {
    logger.warn(`[OBRAS] Tentativa de favoritar sem login | IP: ${req.ip}`);
    return res.redirect("/login");
  }
  const usuId = req.session.usuario.id_usu;
  const obraId = req.params.id.includes("=")
    ? req.params.id.split("=")[1]
    : req.params.id;

  const agora = Date.now();
  const ultimoClique = req.session.ultimoFav?.[obraId] || 0;

  if (agora - ultimoClique < 5000) {
    logger.warn(`[OBRAS] Favoritar bloqueado por 5s | ObraID: ${obraId} | UsuarioID: ${usuId} | IP: ${req.ip}`);
    req.session.erro = "Espere pelo menos 5 segundos antes de favoritar novamente.";
    return res.redirect(`/obras/${obraId}`); 
  }

  req.session.ultimoFav = {
    ...(req.session.ultimoFav || {}),
    [obraId]: agora,
  };

  try {
    if (await jaFavoritou(usuId, obraId)) {
      await desfavoritarObra(usuId, obraId);
      logger.info(`[OBRAS] Obra desfavoritada | ObraID: ${obraId} | UsuarioID: ${usuId} | IP: ${req.ip}`);
    } else {
      await favoritarObra(usuId, obraId);
      logger.info(`[OBRAS] Obra favoritada | ObraID: ${obraId} | UsuarioID: ${usuId} | IP: ${req.ip}`);
    }
    res.redirect(`/obras/${obraId}`);
  } catch (err) {
    logger.error(`[OBRAS] Erro ao favoritar/desfavoritar obra | ObraID: ${obraId} | UsuarioID: ${usuId} | IP: ${req.ip} | Erro: ${err.message}`);
    res.status(500).send("Erro ao favoritar obra");
  }
});

router.post("/:id/favoritar", async (req, res) => {
  if (!req.session.usuario) {
    logger.warn(`[OBRAS] Tentativa de favoritar via AJAX sem login | IP: ${req.ip}`);
    return res.status(401).json({ sucesso: false, mensagem: "Não autenticado" });
  }

  const id_usu = req.session.usuario.id_usu;
  const id_obr = req.params.id;

  try {
    const jaTem = await jaFavoritou(id_usu, id_obr);
    if (jaTem) {
      await desfavoritarObra(id_usu, id_obr);
      logger.info(`[OBRAS] Obra desfavoritada via AJAX | ObraID: ${id_obr} | UsuarioID: ${id_usu} | IP: ${req.ip}`);
    } else {
      await favoritarObra(id_usu, id_obr);
      logger.info(`[OBRAS] Obra favoritada via AJAX | ObraID: ${id_obr} | UsuarioID: ${id_usu} | IP: ${req.ip}`);
    }

    const total = await contarFavoritos(id_obr);

    return res.json({
      sucesso: true,
      favoritado: !jaTem,
      total,
    });
  } catch (err) {
    logger.error(`[OBRAS] Erro ao favoritar via AJAX | ObraID: ${id_obr} | UsuarioID: ${id_usu} | IP: ${req.ip} | Erro: ${err.message}`);
    return res.status(500).json({ sucesso: false, mensagem: "Erro interno" });
  }
});

router.post("/:id/comentar", async (req, res) => {
  if (!req.session.usuario) {
    logger.warn(`[OBRAS] Tentativa de comentar sem login | IP: ${req.ip}`);
    return res.redirect("/login");
  }

  const id_usu = req.session.usuario.id_usu;
  const id_obr = req.params.id;
  const comentario = req.body.comentario;

  if (!comentario || comentario.length > 255) {
    logger.warn(`[OBRAS] Comentário inválido | ObraID: ${id_obr} | UsuarioID: ${id_usu} | IP: ${req.ip}`);
    req.session.erro = "Comentário inválido: precisa ter entre 1 e 255 caracteres.";
    return res.redirect(`/obras/${id_obr}`);
  }

  try {
    await comentarObra(id_usu, id_obr, comentario);
    logger.info(`[OBRAS] Comentário enviado | ObraID: ${id_obr} | UsuarioID: ${id_usu} | IP: ${req.ip}`);
    req.session.sucessoComentario = "Comentário enviado com sucesso!";
    res.redirect(`/obras/${id_obr}`);
  } catch (err) {
    logger.error(`[OBRAS] Erro ao comentar | ObraID: ${id_obr} | UsuarioID: ${id_usu} | IP: ${req.ip} | Erro: ${err.message}`);
    req.session.erro = "Erro ao enviar comentário.";
    res.redirect(`/obras/${id_obr}`);
  }
});

router.post("/:id/comentarios/:id_com/excluir", async (req, res) => {
  if (!req.session.usuario) {
    logger.warn(`[OBRAS] Tentativa de excluir comentário sem login | IP: ${req.ip}`);
    return res.redirect("/login");
  }

  const id_com = req.params.id_com;
  const id_obr = req.params.id;
  const usuarioLogado = req.session.usuario;

  try {
    const comentarios = await buscarComentariosPorObra(id_obr);
    const comentario = comentarios.find(c => c.id_com == id_com);

    if (!comentario) {
      logger.warn(`[OBRAS] Comentário não encontrado para exclusão | ComentarioID: ${id_com} | ObraID: ${id_obr} | UsuarioID: ${usuarioLogado.id_usu} | IP: ${req.ip}`);
      req.session.erro = "Comentário não encontrado.";
      return res.redirect(`/obras/${id_obr}`);
    }

    const obra = await buscarUmaObra(id_obr);
    if (
      usuarioLogado.id_usu !== comentario.id_usu &&
      usuarioLogado.id_usu !== obra.id_art
    ) {
      logger.warn(`[OBRAS] Usuário sem permissão para excluir comentário | ComentarioID: ${id_com} | ObraID: ${id_obr} | UsuarioID: ${usuarioLogado.id_usu} | IP: ${req.ip}`);
      req.session.erro = "Você não tem permissão para excluir esse comentário.";
      return res.redirect(`/obras/${id_obr}`);
    }

    await excluirComentario(id_com);
    logger.info(`[OBRAS] Comentário excluído com sucesso | ComentarioID: ${id_com} | ObraID: ${id_obr} | UsuarioID: ${usuarioLogado.id_usu} | IP: ${req.ip}`);
    req.session.sucesso = "Comentário excluído com sucesso.";
    res.redirect(`/obras/${id_obr}`);
  } catch (err) {
    logger.error(`[OBRAS] Erro ao excluir comentário | ComentarioID: ${id_com} | ObraID: ${id_obr} | UsuarioID: ${usuarioLogado.id_usu} | IP: ${req.ip} | Erro: ${err.message}`);
    req.session.erro = "Erro ao tentar excluir o comentário.";
    res.redirect(`/obras/${id_obr}`);
  }
});


module.exports = router;