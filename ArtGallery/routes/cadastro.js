// routes/cadastro.js
const express = require('express');
const router = express.Router();
const { registrarUsuario } = require('../banco'); //importa a funça~p registrarUsuario


router.get('/', (req, res) => {
    res.render('cadastro'); // vai buscar views/cadastro.ejs
});

router.get('/artista', (req, res) => {
    res.render('cadArtista');
});

router.get('/apreciador', (req, res) => {
    res.render('cadApreciador');
});

//recebe cadastro do artista
router.post('/artista', async (req, res) => {
    try{
    const dadosUsuario = {
        email: req.body.email,
        nome: req.body.nome,
        usuario: req.body.usuario,
        senha: req.body.senha,
        tipo_usu: 'artista'
    };

    await registrarUsuario(dadosUsuario);
    res.redirect('/login');

    } catch(erro){
        console.erro('Erro ao cadastrrar artista', erro);
        res.status(500).send('Erro no cadastro do artista');
    }
});

router.post('/apreciador', async (req, res) => {
    try{
        const dadosUsuario = {
            email: req.body.email,
            nome: req.body.nome,
            usuario: req.body.usuario,
            senha: req.body.senha,
            tipo_usu: 'apreciador'
        };
    await registrarUsuario(dadosUsuario);
    res.redirect('/login');

    } catch(erro){
        console.erro('Erro ao cadastrar aprecidor:', erro);
        res.status(500).send('Erro ao cadastrar apreciador');
    }
});



module.exports = router;
