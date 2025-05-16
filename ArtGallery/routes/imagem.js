const express = require('express');
const router = express.Router();
const banco = require('../banco'); // onde está a função buscarImagemPorId

router.get('/imagem/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const imagem = await banco.buscarImagemPorId(id);
    if (!imagem) {
        return res.status(404).send('Imagem não encontrada');
    }
    res.writeHead(200, { 'Content-Type': 'image/jpeg' }); // ajuste o tipo se precisar
    res.end(imagem, 'binary');
    } catch (error) {
        console.error('Erro ao buscar imagem:', error);
        res.status(500).send('Erro ao buscar imagem');
    }
});

module.exports = router;
