// routes/cadastro.js

const express = require('express');
const router = express.Router();


router.get('/artista', (req, res) => {
    res.render('cadArtista');
});

router.get('/apreciador', (req, res) => {
    res.render('cadApreciador');
});

// Exibe a tela de escolha de perfil
router.get('/', (req, res) => {
    res.render('cadastro'); // vai buscar views/cadastro.ejs
});

// Rotas que recebem os botões do formulário
/*router.post('/artista', (req, res) => {
    res.send('Perfil Artista selecionado');
});

router.post('/apreciador', (req, res) => {
    res.send('Perfil Apreciador selecionado');
}); */



module.exports = router;
