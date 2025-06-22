const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { verificarEmailExiste } = require('../banco');

router.get('/recuperar', (req, res) => {
  res.render('recuperar', { erro: null, mensagem: null });
});

router.post('/recuperar', async (req, res) => {
  const { email } = req.body;

  try {
    const existe = await verificarEmailExiste(email);

    if (!existe) {
      return res.render('recuperar', {
        erro: 'E-mail não encontrado.',
        mensagem: null,
      });
    }

    // Gerar código
    const codigo = Math.floor(100000 + Math.random() * 900000);

    // Configurar transporte do Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'projeto.artgallery@gmail.com',
        pass: 'tqjt tmwq rknx wguo',
      },
    });

    // Enviar e-mail
    await transporter.sendMail({
      from: 'ArtGallery <SEU_EMAIL@gmail.com>',
      to: email,
      subject: 'Código de verificação - ArtGallery',
      text: `Seu código de verificação é: ${codigo}`,
    });

    // Salvar código em memória ou sessão (temporário)
    req.session = req.session || {};
    req.session.codigoVerificacao = codigo;
    req.session.emailVerificacao = email;

    res.render('recuperar', {
      erro: null,
      mensagem: 'Código enviado para seu e-mail.',
    });

  } catch (err) {
    console.error('Erro ao enviar código:', err);
    res.render('recuperar', {
      erro: 'Erro ao enviar e-mail. Tente novamente.',
      mensagem: null,
    });
  }
});

module.exports = router;
