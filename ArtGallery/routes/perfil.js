// routes/perfil.js
const express = require("express");
const router = express.Router();
const {
   buscarObrasFavoritas,
   buscarDadosUsuario,
   buscarDadosUsuarioPorId,
   buscarColecoesPorUsuario,
} = require("../banco");

const autenticado = require('../middlewares/autenticado');

// Página principal do perfil (usuário autenticado)
router.get("/", autenticado, async (req, res) => {
   try {
      const usuarioSessao = req.session.usuario;

      const usuario = await buscarDadosUsuarioPorId(usuarioSessao.id_usu);
      const colecoes = await buscarColecoesPorUsuario(usuarioSessao.id_usu);
      const favoritos = await buscarObrasFavoritas(usuarioSessao.id_usu);

      res.render("perfil", {
         title: "Perfil - ArtGallery",
         usuario:{
            id_usu: usuario.id_usu, 
            nome_usu: usuario.nome_usu, 
            nome_comp: usuario.nome_comp, 
            email_usu: usuario.email_usu, 
            foto_usu: usuario.foto_usu, 
            bio_usu: usuario.bio_usu, 
            tipo_usu: usuario.tipo_usu 
         },
         colecoes,
         favoritos,
      });
   } catch (err) {
      console.error("Erro ao carregar perfil:", err);
      res.status(500).send("Erro ao carregar perfil");
   }
});

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
