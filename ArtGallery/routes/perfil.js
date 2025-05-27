// routes/perfil.js
const express = require("express");
const router = express.Router();
const {
  // importe aqui outras funções futuras...
} = require("../banco")

router.get("/", async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }
  try {
    const usuario = req.session.usuario;
    // Aqui você pode buscar mais informações do usuário, se necessário
    res.render("perfil", {
      title: "Perfil - ArtGallery",
      usuario: usuario,
      // Adicione outras informações que deseja exibir no perfil
    });
  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
    res.status(500).send("Erro ao carregar perfil");
  }
});

module.exports = router;