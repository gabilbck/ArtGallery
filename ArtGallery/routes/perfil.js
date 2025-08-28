// routes/perfil.js
const express = require("express");
const router = express.Router();
const { uploadPerfil } = require("../utils/upload");
const { logger } = require('../logger'); //->impoirt o logger
const {
   conectarBD,
   buscarObrasFavoritas,
   buscarDadosUsuarioPorId,
   buscarArtistaPorIdUsu,
   buscarArtistaPorIdArt,
   buscarObrasArtista,
   contarFavoritosArtista,
   contarFavoritosUsuario,
   buscarColecoesPorUsuario,
   seguirUsuario,
   deixarDeSeguirUsuario,
   estaSeguindo,
   getQtdSeguidores,
   getQtdSeguindo,
} = require("../banco");

const autenticado = require("../middlewares/autenticado");

// Página principal do perfil (usuário autenticado)
router.get("/", autenticado, async (req, res) => {
   try {
      const usuarioSessao = req.session.usuario;
      logger.info(`[PERFIL] Usuário acessou seu perfil | UsuarioID: ${usuarioSessao.id_usu} | IP: ${req.ip}`);

      const usuario = await buscarDadosUsuarioPorId(usuarioSessao.id_usu);
      if (!usuario) {
         logger.warn(`[PERFIL] Usuário não encontrado ao acessar perfil | UsuarioID: ${usuarioSessao.id_usu} | IP: ${req.ip}`);
         return res.status(404).send("Usuário não encontrado");
      }
      
      if(usuarioSessao.tipo_usu !== "art"){
         const colecoes = await buscarColecoesPorUsuario(usuarioSessao.id_usu);
         const favoritos = await buscarObrasFavoritas(usuarioSessao.id_usu);
         const totalSeguindo = await getQtdSeguindo(usuarioSessao.id_usu);
         const favoritosPer = await contarFavoritosUsuario(usuario.id_usu);
         logger.info(`[PERFIL] Dados carregados para perfil de usuário | UsuarioID: ${usuarioSessao.id_usu} | IP: ${req.ip}`);
         res.render("perfil", {
            title: "Perfil - ArtGallery",
            usuario: {
               id_usu: usuario.id_usu,
               nome_usu: usuario.nome_usu,
               nome_comp: usuario.nome_comp,
               email_usu: usuario.email_usu,
               foto_usu: usuario.foto_usu,
               bio_usu: usuario.bio_usu,
               tipo_usu: usuario.tipo_usu,
            },
            favoritosPer,
            colecoes,
            favoritos,
            totalSeguindo,
            totalSeguidores: null
         });
      } else{
         const artista = await buscarArtistaPorIdArt(usuarioSessao.id_art);
         const totalSeguidores = await getQtdSeguidores(usuarioSessao.id_art);
         const obras = await buscarObrasArtista(usuarioSessao.id_art);
         const favoritosPer = await contarFavoritosArtista(usuario.id_art);
         logger.info(`[PERFIL] Dados carregados para perfil de artista | ArtistaID: ${usuarioSessao.id_art} | UsuarioID: ${usuarioSessao.id_usu} | IP: ${req.ip}`);
         res.render("perfil", {
            title: "Perfil - ArtGallery",
            usuario: {
               id_usu: usuario.id_usu,
               id_art: artista.id_art,
               nome_usu: usuario.nome_usu,
               nome_comp: usuario.nome_comp,
               email_usu: usuario.email_usu,
               foto_usu: usuario.foto_usu,
               bio_usu: usuario.bio_usu,
               tipo_usu: usuario.tipo_usu,
               obras,
            },
            favoritosPer,
            totalSeguidores,
            colecoes: null,
            favoritos: null,
            totalSeguindo: null
         });
      }

   } catch (err) {
      logger.error(`[PERFIL] Erro ao carregar perfil | UsuarioID: ${req.session.usuario?.id_usu} | IP: ${req.ip} | Erro: ${err.message}`);
      res.status(500).send("Erro ao carregar perfil");
   }
});

router.get("/editar-perfil", autenticado, async (req, res) => {
  logger.info(`[PERFIL] Usuário acessou página de edição de perfil | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
  const usuario = await buscarDadosUsuarioPorId(req.session.usuario.id_usu);
  if (!usuario) {
    logger.warn(`[PERFIL] Usuário não encontrado ao editar perfil | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
    return res.status(404).send("Usuário não encontrado.");
  }
  res.render("editarPerfil", { usuario });
});

router.post("/editar-perfil", autenticado, uploadPerfil.single("foto_usu"), async (req, res) => {
  const conexao = await conectarBD();
  const { nome_comp, nome_usu, bio_usu } = req.body;
  const id_usu = req.session.usuario.id_usu;
  let fotoPath = req.session.usuario.foto_usu;

  if (req.file) {
    fotoPath = "/uploads/fotos-perfil/" + req.file.filename;
    logger.info(`[PERFIL] Foto de perfil atualizada | UsuarioID: ${id_usu} | IP: ${req.ip}`);
  }

  try {
    await conexao.query(
      "UPDATE usuario SET nome_comp = ?, nome_usu = ?, bio_usu = ?, foto_usu = ? WHERE id_usu = ?",
      [nome_comp, nome_usu, bio_usu, fotoPath, id_usu]
    );

    req.session.usuario.nome_usu = nome_usu;
    req.session.usuario.foto_usu = fotoPath;

    logger.info(`[PERFIL] Perfil atualizado com sucesso | UsuarioID: ${id_usu} | IP: ${req.ip}`);
    res.redirect("/perfil");
  } catch (err) {
    logger.error(`[PERFIL] Erro ao atualizar perfil | UsuarioID: ${id_usu} | IP: ${req.ip} | Erro: ${err.message}`);
    res.status(500).send("Erro ao atualizar perfil.");
  }
});

// Página de perfil público
router.get("/perfilVisitante/:id", autenticado, async (req, res) => {
   const id_usu = req.params.id;
   const usuarioSessao = req.session.usuario;

   logger.info(`[PERFIL] Usuário acessou perfil visitante | VisitadoID: ${id_usu} | UsuarioID: ${usuarioSessao.id_usu} | IP: ${req.ip}`);

   if (!id_usu || isNaN(Number(id_usu))) {
      logger.warn(`[PERFIL] ID inválido ao acessar perfil visitante | VisitadoID: ${id_usu} | UsuarioID: ${usuarioSessao.id_usu} | IP: ${req.ip}`);
      return res.status(400).send("ID inválido");
   }

   try {
      const usuario = await buscarDadosUsuarioPorId(id_usu);
      if (!usuario) {
        logger.warn(`[PERFIL] Usuário visitante não encontrado | VisitadoID: ${id_usu} | UsuarioID: ${usuarioSessao.id_usu} | IP: ${req.ip}`);
        return res.status(404).send("Usuário não encontrado");
      }

      const colecoes = await buscarColecoesPorUsuario(id_usu);
      const favoritos = await buscarObrasFavoritas(id_usu);
      const totalSeguindo = await getQtdSeguindo(id_usu);
      const favoritosPer = await contarFavoritosUsuario(id_usu);

      logger.info(`[PERFIL] Dados carregados para perfil visitante | VisitadoID: ${id_usu} | UsuarioID: ${usuarioSessao.id_usu} | IP: ${req.ip}`);
      res.render("perfilVisitante", {
         title: `Perfil de ${usuario.nome_usu}`,
         usuario: {
            id_usu: usuario.id_usu,
            nome_usu: usuario.nome_usu,
            nome_comp: usuario.nome_comp,
            email_usu: usuario.email_usu,
            foto_usu: usuario.foto_usu,
            bio_usu: usuario.bio_usu,
            tipo_usu: usuario.tipo_usu,
         },
         colecoes,
         favoritos,
         usuarioSessao,
         totalSeguindo,
         favoritosPer
      });
   } catch (err) {
      logger.error(`[PERFIL] Erro ao carregar perfil visitante | VisitadoID: ${id_usu} | UsuarioID: ${usuarioSessao.id_usu} | IP: ${req.ip} | Erro: ${err.message}`);
      res.status(500).send("Erro ao carregar perfil");
   }
});

// Seguir usuário
router.post("/seguir/:id_art", autenticado, async (req, res) => {
   const seguidorId = req.session.usuario.id_usu;
   const seguidoId = req.params.id_art;

   logger.info(`[PERFIL] Tentativa de seguir artista | SeguidorID: ${seguidorId} | SeguidoID: ${seguidoId} | IP: ${req.ip}`);

   try {
      const jaSegue = await estaSeguindo(seguidorId, seguidoId);
      if (!jaSegue) {
         await seguirUsuario(seguidorId, seguidoId);
         logger.info(`[PERFIL] Usuário começou a seguir artista | SeguidorID: ${seguidorId} | SeguidoID: ${seguidoId} | IP: ${req.ip}`);
      } else {
         logger.info(`[PERFIL] Usuário já segue artista | SeguidorID: ${seguidorId} | SeguidoID: ${seguidoId} | IP: ${req.ip}`);
      }
      res.redirect(`/perfil/perfilArtista/${seguidoId}`);
   } catch (error) {
      logger.error(`[PERFIL] Erro ao seguir artista | SeguidorID: ${seguidorId} | SeguidoID: ${seguidoId} | IP: ${req.ip} | Erro: ${error.message}`);
      res.status(500).send("Erro ao seguir usuário.");
   }
});

// Deixar de seguir usuário
router.post("/desseguir/:id_art", autenticado, async (req, res) => {
   const seguidorId = req.session.usuario.id_usu;
   const seguidoId = req.params.id_art;

   logger.info(`[PERFIL] Tentativa de deixar de seguir artista | SeguidorID: ${seguidorId} | SeguidoID: ${seguidoId} | IP: ${req.ip}`);

   try {
      const jaSegue = await estaSeguindo(seguidorId, seguidoId);
      if (jaSegue) {
         await deixarDeSeguirUsuario(seguidorId, seguidoId);
         logger.info(`[PERFIL] Usuário deixou de seguir artista | SeguidorID: ${seguidorId} | SeguidoID: ${seguidoId} | IP: ${req.ip}`);
      } else {
         logger.info(`[PERFIL] Usuário já não seguia artista | SeguidorID: ${seguidorId} | SeguidoID: ${seguidoId} | IP: ${req.ip}`);
      }
      res.redirect(`/perfil/perfilArtista/${seguidoId}`);
   } catch (error) {
      logger.error(`[PERFIL] Erro ao deixar de seguir artista | SeguidorID: ${seguidorId} | SeguidoID: ${seguidoId} | IP: ${req.ip} | Erro: ${error.message}`);
      res.status(500).send("Erro ao deixar de seguir usuário.");
   }
});

router.get("/perfilArtista/:id_art", autenticado, async (req, res) => {
   const usuarioSessao = req.session.usuario;
   const id_usu = req.session.usuario.id_usu;
   const id_art = req.params.id_art;

   logger.info(`[PERFIL] Usuário acessou perfil de artista | ArtistaID: ${id_art} | UsuarioID: ${id_usu} | IP: ${req.ip}`);

   const artista = await buscarArtistaPorIdArt(id_art);
   const obras = await buscarObrasArtista(id_art);
   const favoritosPer = await contarFavoritosArtista(id_art);

   let isFollowing = false;
   const conexao = await conectarBD();
   const [rows] = await conexao.query(
      "SELECT 1 FROM seguidores WHERE seguidor_id = ? AND seguido_id = ? LIMIT 1",
      [id_usu, id_art]
   );
   isFollowing = rows.length > 0;

   const totalSeguidores = await getQtdSeguidores(id_art);

   try {
      if (artista.id_usu != null && artista.id_usu === id_usu){
         const pertencente = true;
         logger.info(`[PERFIL] Artista acessou seu próprio perfil | ArtistaID: ${id_art} | UsuarioID: ${id_usu} | IP: ${req.ip}`);
         res.render("perfilArtista", {
            title: `Perfil de ${artista.nome_usu}`,
            artista: {
               nome_comp: artista.nome_comp,
               nome_usu: artista.nome_usu,
               bio_art: artista.bio_art,
               id_art: artista.id_art,
               foto_art: artista.foto_art,
            },
            favoritosPer,
            pertencente,
            obras,
            usuarioSessao,
            isFollowing,
            totalSeguidores
         });
      } else {
         const pertencente = false;
         logger.info(`[PERFIL] Usuário acessou perfil de outro artista | ArtistaID: ${id_art} | UsuarioID: ${id_usu} | IP: ${req.ip}`);
         res.render("perfilArtista", {
            title: `Perfil de ${artista.nome_usu}`,
            artista: {
               nome_comp: artista.nome_comp,
               nome_usu: artista.nome_usu,
               bio_art: artista.bio_art,
               id_art: artista.id_art,
               foto_art: artista.foto_art,
            },
            favoritosPer,
            pertencente,
            obras,
            usuarioSessao,
            isFollowing,
            totalSeguidores
         });
      }
   } catch (err) {
      logger.error(`[PERFIL] Erro ao carregar perfil do artista | ArtistaID: ${id_art} | UsuarioID: ${id_usu} | IP: ${req.ip} | Erro: ${err.message}`);
      res.status(500).send("Erro ao carregar perfil do artista");
   }
});

module.exports = router;
