// routes/perfil.js
const express = require("express");
const router = express.Router();
const {
   conectarBD,
   buscarObrasFavoritas,
   buscarDadosUsuarioPorId,
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

      const usuario = await buscarDadosUsuarioPorId(usuarioSessao.id_usu);
      if (!usuario) {
         return res.status(404).send("Usuário não encontrado");
      }
      const colecoes = await buscarColecoesPorUsuario(usuarioSessao.id_usu);
      const favoritos = await buscarObrasFavoritas(usuarioSessao.id_usu);

      const totalSeguidores = await getQtdSeguidores(usuarioSessao.id_usu);
      const totalSeguindo = await getQtdSeguindo(usuarioSessao.id_usu);

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
         colecoes,
         favoritos,
         totalSeguidores,
         totalSeguindo,
      });
   } catch (err) {
      console.error("Erro ao carregar perfil:", err);
      res.status(500).send("Erro ao carregar perfil");
   }
});

// Página de perfil público
router.get("/perfilVisitante/:id", autenticado, async (req, res) => {
   const id_usu = req.params.id; // ID do usuário a ser visualizado
   const usuarioSessao = req.session.usuario;

   // Validação do ID
   if (!id_usu || isNaN(Number(id_usu))) {
      return res.status(400).send("ID inválido");
   }

   try {
      const usuario = await buscarDadosUsuarioPorId(id_usu);
      if (!usuario) return res.status(404).send("Usuário não encontrado");

      const colecoes = await buscarColecoesPorUsuario(id_usu);
      const favoritos = await buscarObrasFavoritas(id_usu);

      // Aqui consulta se o usuário da sessão está seguindo o usuário visitado
      let isFollowing = false;
      if (usuarioSessao && usuarioSessao.id_usu !== Number(id_usu)) {
         const conexao = await conectarBD();
         const [rows] = await conexao.query(
            "SELECT 1 FROM seguidores WHERE seguidor_id = ? AND seguido_id = ? LIMIT 1",
            [usuarioSessao.id_usu, id_usu]
         );
         isFollowing = rows.length > 0;
      }

      const totalSeguidores = await getQtdSeguidores(id_usu);
      const totalSeguindo = await getQtdSeguindo(id_usu);

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
         ehDono:
            usuarioSessao && String(usuarioSessao.id_usu) === String(id_usu),
         usuarioSessao,
         isFollowing,
         totalSeguidores,
         totalSeguindo,
      });
   } catch (err) {
      console.error("Erro ao carregar perfil visitante:", err);
      res.status(500).send("Erro ao carregar perfil");
   }
});

// Seguir usuário
router.post("/seguir/:id", autenticado, async (req, res) => {
   const seguidorId = req.session.usuario.id_usu;
   const seguidoId = parseInt(req.params.id, 10);

   // Validação do ID
   if (!seguidoId || isNaN(seguidoId)) {
      return res.status(400).send("ID inválido");
   }

   try {
      const jaSegue = await estaSeguindo(seguidorId, seguidoId);
      if (!jaSegue) {
         await seguirUsuario(seguidorId, seguidoId);
      }
      res.redirect(`/perfil/perfilVisitante/${seguidoId}`);
   } catch (error) {
      console.error("Erro ao seguir usuário:", error);
      res.status(500).send("Erro ao seguir usuário.");
   }
});

// Deixar de seguir usuário
router.post("/desseguir/:id", autenticado, async (req, res) => {
   const seguidorId = req.session.usuario.id_usu;
   const seguidoId = parseInt(req.params.id, 10);

   // Validação do ID
   if (!seguidoId || isNaN(seguidoId)) {
      return res.status(400).send("ID inválido");
   }

   try {
      const jaSegue = await estaSeguindo(seguidorId, seguidoId);
      if (jaSegue) {
         await deixarDeSeguirUsuario(seguidorId, seguidoId);
      }
      res.redirect(`/perfil/perfilVisitante/${seguidoId}`);
   } catch (error) {
      console.error("Erro ao deixar de seguir usuário:", error);
      res.status(500).send("Erro ao deixar de seguir usuário.");
   }
});

module.exports = router;

/*
// Página de favoritos
router.get("/favoritos", autenticado, async (req, res) => {
   try {
      const usuario = req.session.usuario;
      const obrasFavoritas = await buscarObrasFavoritas(usuario.id);

      res.render("favoritos", {
         title: "Favoritos – ArtGallery",
         usuario,
         obras: obrasFavoritas.map((o) => ({
            id: o.id,
            nome: o.nome,
            art: o.art,
            foto: o.foto,
            tabela: "obra",
         })),
      });
   } catch (err) {
      console.error("Erro ao carregar obras favoritas:", err);
      res.status(500).send("Erro ao carregar favoritos");
   }
});
*/

// Página de coleções
/*
router.get("/colecoes", autenticado, async (req, res) => {
   try {
      const usuario = req.session.usuario;
      const colecoes = await buscarColecoesPorUsuario(usuario.id);

      res.render("colecoes", {
         title: `Coleções de ${usuario.nome} - ArtGallery`,
         usuario,
         colecoes,
      });
   } catch (err) {
      console.error("Erro ao carregar coleções:", err);
      res.status(500).send("Erro ao carregar coleções");
   }
});
*/

module.exports = router;
