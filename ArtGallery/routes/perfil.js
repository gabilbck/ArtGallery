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

      const usuario = await buscarDadosUsuarioPorId(usuarioSessao.id);
      const colecoes = await buscarColecoesPorUsuario(usuarioSessao.id);
      const favoritos = await buscarObrasFavoritas(usuarioSessao.id);

      res.render("perfil", {
         title: "Perfil - ArtGallery",
         usuario,
         colecoes,
         favoritos,
      });
   } catch (err) {
      console.error("Erro ao carregar perfil:", err);
      res.status(500).send("Erro ao carregar perfil");
   }
});

// Rota para processar o login
router.post("/login", async (req, res) => {
   const { email, senha } = req.body;

   try {
      const usuario = await buscarDadosUsuario({ email, senha });

      if (!usuario) {
         return res.render("login", { erro: "Credenciais inválidas" });
      }

      req.session.usuario = {
         id: usuario.id_usu,
         nome: usuario.nome_usu,
         email: usuario.email_usu,
      };

      res.redirect("/perfil");
   } catch (error) {
      console.error("Erro ao processar login:", error);
      res.render("login", { erro: "Erro ao processar login" });
   }
});

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

// Página de coleções
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

module.exports = router;
