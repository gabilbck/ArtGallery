// routes/index.js
const express = require("express");
const router = express.Router();
const {
  buscarInicioCategorias,
  buscarTodasObras,
  buscarTodasCategorias,
  buscarUsuario
  // importe aqui outras funções futuras...
} = require("../banco");

// Rota principal: exibe vários “itens” (categorias, produtos, etc.)
router.get("/", async (req, res) => {
  try {
    // busca de cada tipo
    const categorias = await buscarInicioCategorias();
    const obras = await buscarTodasObras();
    // monte um array unificado de “itens”
    const itensC = [
      ...categorias.map(c => ({ id: c.id, nome: c.nome, foto: c.foto, tabela: "categoria" })),
      // ...peça para adicionar outros tipos aqui
    ];
    const itensO = [
      ...obras.map(o => ({ id: o.id, nome: o.nome, tabela: "obra" })),
    ];

    res.render("index", {
      title: "Página Inicial - ArtGallery",
      usuario: req.session.usuario || null,
      itens: itensC, itensO,   
    });
  } catch (erro) {
    console.error("Erro ao buscar dados:", erro);
    res.status(500).send("Erro ao carregar dados");
  }
});

// Rota de logout
router.get("/logout", (req, res) => {
  if (req.session.usuario) {
    req.session.destroy(() => res.redirect("/"));
  } else {
    res.redirect("/");
  }
});

module.exports = router;
