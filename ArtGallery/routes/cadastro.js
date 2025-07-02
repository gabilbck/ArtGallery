// routes/cadastro.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { registrarUsuario } = require('../banco');

// Armazena códigos temporariamente (use banco em produção)
const codigosVerificacao = {};

router.get('/', (req, res) => {
    res.render('cadastro');
});

router.get('/artista', (req, res) => {
    res.render('cadArtista', { sucesso: false, erros: null });
});

router.get('/apreciador', (req, res) => {
    res.render('cadApreciador', { sucesso: false, erros: null });
});

// ✅ Enviar código de verificação por e-mail
router.post('/verificar-email', async (req, res) => {
    const { email } = req.body;

    const codigo = Math.floor(100000 + Math.random() * 900000); // 6 dígitos

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'projeto.artgallery@gmail.com',
            pass: 'tqjt tmwq rknx wguo', // Senha de app, não a senha normal
        },
    });

    const mailOptions = {
        from: 'ArtGallery <projeto.artgallery@gmail.com>',
        to: email,
        subject: 'Código de verificação - ArtGallery',
        text: `Seu código de verificação é: ${codigo}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        codigosVerificacao[email] = codigo;
        res.status(200).json({ sucesso: true, mensagem: 'Código enviado com sucesso.' });
    } catch (error) {
        console.error('Erro ao enviar código:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao enviar o código.' });
    }
});

// ✅ Verificar código
router.post('/validar-codigo', (req, res) => {
    const { email, codigoDigitado } = req.body;
    const codigoSalvo = codigosVerificacao[email];

    if (codigoSalvo && codigoSalvo == codigoDigitado) {
        delete codigosVerificacao[email]; // Remove após uso
        return res.status(200).json({ sucesso: true });
    }

    res.status(400).json({ sucesso: false, mensagem: 'Código inválido ou expirado.' });
});

// ✅ Cadastro artista
router.post('/artista', async (req, res) => {
    try {
        const dadosUsuario = {
            email: req.body.email,
            nome: req.body.nome,
            usuario: req.body.usuario,
            senha: req.body.senha,
            tipo_usu: 'art'
        };

        await registrarUsuario(dadosUsuario);

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

// ✅ Cadastro apreciador
router.post('/apreciador', async (req, res) => {
    try {
        const dadosUsuario = {
            email: req.body.email,
            nome: req.body.nome,
            usuario: req.body.usuario,
            senha: req.body.senha,
            tipo_usu: 'apr'
        };

        await registrarUsuario(dadosUsuario);

        res.render('cadApreciador', {
            sucesso: true,
            erros: null
        });

    } catch (erro) {
        console.error('Erro ao cadastrar apreciador:', erro);
        res.render('cadApreciador', {
            sucesso: false,
            erros: 'Erro ao cadastrar apreciador. Tente novamente.'
        });
    }
});

module.exports = router;