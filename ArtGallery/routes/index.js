// routes/index.js
const express = require("express");
const router = express.Router();
const {
  buscarTodasCategorias,
  buscarTodosProdutos,
  buscarTodasObras,
  // importe aqui outras funções futuras...
} = require("../banco");

// Rota principal: exibe vários “itens” (categorias, produtos, etc.)
router.get("/", async (req, res) => {
  try {
    // busca de cada tipo
    const categorias = await buscarTodasCategorias();
    const obras = await buscarTodasObras();
    // monte um array unificado de “itens”
    const itens = [
      ...categorias.map(c => ({ id: c.id, nome: c.nome, tabela: "categoria" })),
      ...obras.map(o => ({ id: o.id, nome: o.nome, tabela: "obra" })),
      // ...peça para adicionar outros tipos aqui
    ];

    res.render("index", {
      title: "Página Inicial - ArtGallery",
      usuario: req.session.usuario || null,
      itens: itens,          // agora passa “itens” em vez de “categorias”
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
