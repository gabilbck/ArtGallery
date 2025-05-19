// routes/imagem.js
const express = require('express');
const router = express.Router();
const { buscarImagem } = require('../banco');

const configTabelas = {
  categoria: { idCol: 'id_cat', blobCol: 'foto_cat' },
  // adicione aqui outras tabelas no formato:
  // tabelaNome: { idCol: 'col_id', blobCol: 'col_blob' }
};

router.get('/:tabela/:id', async (req, res) => {
  const { tabela, id } = req.params;
  const cfg = configTabelas[tabela];
  if (!cfg) return res.status(404).send('Tabela não configurada para imagens');

  try {
    const imgBuffer = await buscarImagem(tabela, cfg.idCol, id, cfg.blobCol);
    if (!imgBuffer) return res.status(404).send('Imagem não encontrada');
    res.type('jpeg').send(imgBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao carregar imagem');
  }
});

module.exports = router;
