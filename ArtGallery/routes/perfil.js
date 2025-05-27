// routes/perfil.js
const express = require("express");
const router = express.Router();
const { buscarUsuario } = require("../banco"); // <- ajuste aqui

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

router.get("/:id", async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }
  const usuarioId = req.params.id;
  try {
    // Aqui você pode buscar informações específicas do usuário pelo ID
    const usuario = await buscarUsuario(usuarioId); // Implemente essa função no banco
    if (!usuario) {
      return res.status(404).send("Usuário não encontrado");
    }
    res.render("perfil", {
      title: `Perfil de ${usuario.nome} - ArtGallery`,
      usuario: usuario,
      // Adicione outras informações que deseja exibir no perfil
    });
  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
    res.status(500).send("Erro ao carregar perfil");
  }
});

module.exports = router;