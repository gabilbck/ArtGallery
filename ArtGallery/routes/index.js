// routes/index.js
const express = require("express");
const router = express.Router();
const { logger } = require('../logger'); //->impoirt o logger
const {
   buscarInicioCategorias,
   buscarInicioObras,
   buscarUsuario,
   buscarObraAletoria,
   // importe aqui outras funções futuras...
} = require("../banco");

// Rota principal: exibe vários “itens” (categorias, produtos, etc.)
router.get("/", async (req, res) => {
   logger.info(`[INDEX] Usuário acessou a página inicial | IP: ${req.ip} | UsuarioID: ${req.session.usuario?.id_usu || "visitante"}`);
   try {
      const categorias = await buscarInicioCategorias();
      const obras = await buscarInicioObras();
      const obraArtDest = await buscarObraAletoria();

      logger.info(`[INDEX] Dados carregados para página inicial | Categorias: ${categorias.length} | Obras: ${obras.length} | IP: ${req.ip}`);

      const itensC = [
         ...categorias.map((c) => ({
            id: c.id,
            nome: c.nome,
            foto: c.foto,
            tabela: "categoria",
         })),
      ];
      const itensO = [
         ...obras.map((o) => ({
            id: o.id,
            nome: o.nome,
            idArt: o.idArt,
            art: o.art,
            idUsuArt: o.idUsuArt,
            foto: o.foto,
            qfav: o.qfav,
            qcom: o.qcom,
            des: o.des,
            tabela: "obra",
         })),
      ];
      const itensOArtDest = obraArtDest
         ? [
              {
                 id: obraArtDest.id,
                 nome: obraArtDest.nome,
                 art: obraArtDest.art,
                 idArt: obraArtDest.idArt,
                 idUsuArt: obraArtDest.idUsuArt,
                 foto: obraArtDest.foto,
                 tabela: "obra",
              },
           ]
         : [];
      res.render("index", {
         title: "Página Inicial - ArtGallery",
         categorias: itensC,
         obras: itensO,
         obraArtDest: itensOArtDest,
      });
   } catch (erro) {
      logger.error(`[INDEX] Erro ao buscar dados para página inicial | IP: ${req.ip} | UsuarioID: ${req.session.usuario?.id_usu || "visitante"} | Erro: ${erro.message}`);
      res.status(500).send("Erro ao carregar dados");
   }
});

// Rota de logout
router.get("/logout", (req, res) => {
   if (req.session.usuario) {
      logger.info(`[INDEX] Usuário fez logout | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
      req.session.destroy(() => res.redirect("/"));
   } else {
      logger.info(`[INDEX] Logout acessado sem usuário logado | IP: ${req.ip}`);
      res.redirect("/");
   }
});

module.exports = router;
