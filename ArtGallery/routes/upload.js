const express = require('express');
const router = express.Router();
const multer = require('multer');
const { inserirImagem } = require('../banco');

// Configuração Multer: armazena em memória para obter Buffer diretamente
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Form EJS envia campo "imagem" e um "id" de referência
router.post('/:tabela/:id', upload.single('imagem'), async (req, res) => {
  try {
    const { tabela, id } = req.params;
    if (!req.file || !req.file.buffer) {
      return res.status(400).send('Arquivo não recebido');
    }

    // Mapeamento de tabelas → colunas
    const config = {
      categoria: { idCol: 'id_cat', blobCol: 'foto_cat' },
      produto:   { idCol: 'id_prod', blobCol: 'foto_prod' },
      // adicione futuras tabelas aqui...
    };

    const cfg = config[tabela];
    if (!cfg) return res.status(404).send('Tabela não configurada');

    // Chama função de inserção: tabela, coluna de ID, valor de ID, coluna BLOB, Buffer da imagem
    await inserirImagem(tabela, cfg.idCol, id, cfg.blobCol, req.file.buffer);

    res.redirect('/');
  } catch (err) {
    console.error('Erro no upload:', err);
    res.status(500).send('Erro ao cadastrar imagem');
  }
});

module.exports = router;