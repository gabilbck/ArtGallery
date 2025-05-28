// routes/explorar.js
const express = require("express");
const router  = express.Router();

const {
  buscarObraMaisComentada,
  buscarObraMaisFavoritada,
  buscarObraMaisFavoritadaDoArtistaMaisSeguido
} = require("../banco");

router.get("/", async (req, res) => {
  if (!req.session.usuario) return res.redirect("/login");

  try {
    const usuario = req.session.usuario;

    // carrega as três obras-destaque em paralelo
    let [maisComentada, maisFavoritada, doArtistaMaisSeguido] =
      await Promise.all([
        buscarObraMaisComentada(),
        buscarObraMaisFavoritada(),
        buscarObraMaisFavoritadaDoArtistaMaisSeguido()
      ]);

    // evita duplicatas (caso a mesma obra apareça em mais de um critério)
    const vistos = new Set();
    const destaques = [maisComentada, maisFavoritada, doArtistaMaisSeguido]
      .filter(o => o && !vistos.has(o.id) && vistos.add(o.id));

    res.render("explorar", {
      title: "Explorar - ArtGallery",
      usuario,
      destaques               //  <<<<  será usado no EJS
    });
  } catch (err) {
    console.error("Erro ao carregar explorar:", err);
    res.status(500).send("Erro ao carregar explorar");
  }
});

module.exports = router;