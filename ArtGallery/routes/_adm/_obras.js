// routes/index.js
const express = require("express");
const router = express.Router();
const {
  buscarTodasCategorias,
} = require("../../banco");

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

module.exports = router;