// routes/cadastro.js
const express = require('express');
const router = express.Router();
const { registrarUsuario } = require('../banco'); //importa a funça~p registrarUsuario


router.get('/', (req, res) => {
    res.render('cadastro'); // vai buscar views/cadastro.ejs
});

router.get('/artista', (req, res) => {
    res.render('cadArtista', {sucesso: false, erros: null});
});

router.get('/apreciador', (req, res) => {
    res.render('cadApreciador', {sucesso: false, erros: null});
});

//recebe cadastro do artista
//recebe cadastro do artista
router.post('/artista', async (req, res) => {
    try {
        const dadosUsuario = {
            email: req.body.email,
            nome: req.body.nome,
            usuario: req.body.usuario,
            senha: req.body.senha,
            tipo_usu: 'artista'
        };

        await registrarUsuario(dadosUsuario);

        // Exibe tela de sucesso com redirecionamento
        res.render('cadArtista', {
            sucesso: true,
            erros: null
        });

    } catch (erro) {
        console.error('Erro ao cadastrar artista:', erro);
        res.render('cadArtista', {
            sucesso: false,
            erros: 'Erro ao cadastrar artista. Tente novamente.'
        });
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

        res.render('cadApreciador', {
            sucesso: true,
            erros: null
        });

    } catch(erro){
        console.error('Erro ao cadastrar apreciador:', erro);
        res.render('cadApreciador', {
            sucesso: false,
            erros: 'Erro ao cadastrar apreciador. Tente novamente.'
        });
    }
});




module.exports = router;
