// routes/cadastro.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { registrarUsuario } = require('../banco');
const { logger } = require('../logger'); //->impoirt o logger

// Armazena códigos temporariamente (use banco em produção)
const codigosVerificacao = {};

router.get('/', (req, res) => {
    logger.info(`[CADASTRO] Acesso à página de cadastro | IP: ${req.ip}`);
    res.render('cadastro');
});

router.get('/artista', (req, res) => {
    logger.info(`[CADASTRO] Acesso à página de cadastro de artista | IP: ${req.ip}`);
    res.render('cadArtista', { sucesso: false, erros: null });
});

router.get('/apreciador', (req, res) => {
    logger.info(`[CADASTRO] Acesso à página de cadastro de apreciador | IP: ${req.ip}`);
    res.render('cadApreciador', { sucesso: false, erros: null });
});

// ✅ Enviar código de verificação por e-mail
router.post('/verificar-email', async (req, res) => {
    const { email } = req.body;
    logger.info(`[CADASTRO] Solicitação de envio de código de verificação | Email: ${email} | IP: ${req.ip}`);

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
        logger.info(`[CADASTRO] Código de verificação enviado com sucesso | Email: ${email} | IP: ${req.ip}`);
        res.status(200).json({ sucesso: true, mensagem: 'Código enviado com sucesso.' });
    } catch (error) {
        logger.error(`[CADASTRO] Erro ao enviar código de verificação | Email: ${email} | IP: ${req.ip} | Erro: ${error.message}`);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao enviar o código.' });
    }
});

// ✅ Verificar código
router.post('/validar-codigo', (req, res) => {
    const { email, codigoDigitado } = req.body;
    const codigoSalvo = codigosVerificacao[email];

    logger.info(`[CADASTRO] Tentativa de validação de código | Email: ${email} | Código digitado: ${codigoDigitado} | IP: ${req.ip}`);

    if (codigoSalvo && codigoSalvo == codigoDigitado) {
        delete codigosVerificacao[email]; // Remove após uso
        logger.info(`[CADASTRO] Código de verificação validado com sucesso | Email: ${email} | IP: ${req.ip}`);
        return res.status(200).json({ sucesso: true });
    }

    logger.warn(`[CADASTRO] Código de verificação inválido ou expirado | Email: ${email} | Código digitado: ${codigoDigitado} | IP: ${req.ip}`);
    res.status(400).json({ sucesso: false, mensagem: 'Código inválido ou expirado.' });
});

// ✅ Cadastro artista
router.post('/artista', async (req, res) => {
    try {
        const email = req.body.email;
        logger.info(`[CADASTRO] Tentativa de cadastro de artista | Email: ${email} | IP: ${req.ip}`);

        // Verifica se o e-mail contém "@gmail"
        if (!email.includes('@gmail')) {
            logger.warn(`[CADASTRO] Cadastro de artista recusado - email não é gmail | Email: ${email} | IP: ${req.ip}`);
            return res.render('cadArtista', {
                sucesso: false,
                erros: 'É necessário um g-mail para criação da conta!'
            });
        }

        const dadosUsuario = {
            email: email,
            nome: req.body.nome,
            usuario: req.body.usuario,
            senha: req.body.senha,
            tipo_usu: 'art'
        };

        await registrarUsuario(dadosUsuario);

        logger.info(`[CADASTRO] Artista cadastrado com sucesso | Email: ${email} | IP: ${req.ip}`);
        res.render('cadArtista', {
            sucesso: true,
            erros: null
        });

    } catch (erro) {
        logger.error(`[CADASTRO] Erro ao cadastrar artista | Email: ${req.body.email} | IP: ${req.ip} | Erro: ${erro.message}`);
        res.render('cadArtista', {
            sucesso: false,
            erros: 'Erro ao cadastrar artista. Tente novamente.'
        });
    }
});

// ✅ Cadastro apreciador
router.post('/apreciador', async (req, res) => {
    try {
        const email = req.body.email;
        logger.info(`[CADASTRO] Tentativa de cadastro de apreciador | Email: ${email} | IP: ${req.ip}`);

        // Verifica se o e-mail contém "@gmail"
        if (!email.includes('@gmail')) {
            logger.warn(`[CADASTRO] Cadastro de apreciador recusado - email não é gmail | Email: ${email} | IP: ${req.ip}`);
            return res.render('cadApreciador', {
                sucesso: false,
                erros: 'É necessário um g-mail para criação da conta!'
            });
        }

        const dadosUsuario = {
            email: email,
            nome: req.body.nome,
            usuario: req.body.usuario,
            senha: req.body.senha,
            tipo_usu: 'apr'
        };

        await registrarUsuario(dadosUsuario);

        logger.info(`[CADASTRO] Apreciador cadastrado com sucesso | Email: ${email} | IP: ${req.ip}`);
        res.render('cadApreciador', {
            sucesso: true,
            erros: null
        });

    } catch (erro) {
        logger.error(`[CADASTRO] Erro ao cadastrar apreciador | Email: ${req.body.email} | IP: ${req.ip} | Erro: ${erro.message}`);
        res.render('cadApreciador', {
            sucesso: false,
            erros: 'Erro ao cadastrar apreciador. Tente novamente.'
        });
    }
});

module.exports = router;