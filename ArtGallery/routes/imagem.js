// routes/imagem.js
const express = require("express");
const router = express.Router();
const { buscarImagem } = require("../banco");

// Exemplo: /imagem/categoria/1
router.get("/:tabela/:id", async (req, res) => {
  const { tabela, id } = req.params;

  // Defina as colunas de ID e BLOB por tabela:
  const colunas = {
    categoria: { id: "id_cat", blob: "img_cat" },
    obra: { id: "id_obr", blob: "img_obr" },
    // adicione mais tabelas aqui
  };

  if (!colunas[tabela]) {
    return res.status(400).send("Tabela não suportada");
  }

  try {
    const { id: idColuna, blob: blobColuna } = colunas[tabela];
    const imagem = await buscarImagem(tabela, idColuna, id, blobColuna);

    if (!imagem) return res.status(404).send("Imagem não encontrada");

    res.set("Content-Type", "image/jpeg"); // ou image/png dependendo do que armazena
    res.send(imagem);
  } catch (erro) {
    console.error("Erro ao buscar imagem:", erro);
    res.status(500).send("Erro ao carregar imagem");
  }
});

module.exports = router;