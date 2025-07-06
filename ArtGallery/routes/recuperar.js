const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { verificarEmailExiste, atualizarSenhaUsuario } = require('../banco'); // já antecipo o uso da função de atualizar senha
const { conectarBD } = require('../banco');

// Aqui suas rotas seguem normalmente
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

    const codigo = Math.floor(100000 + Math.random() * 900000);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'projeto.artgallery@gmail.com',
        pass: 'tqjt tmwq rknx wguo',
      },
    });

    await transporter.sendMail({
      from: 'ArtGallery <projeto.artgallery@gmail.com>',
      to: email,
      subject: 'Código de verificação - ArtGallery',
      text: `Seu código de verificação é: ${codigo}`,
    });

    req.session = req.session || {};
    req.session.codigoVerificacao = codigo;
    req.session.emailVerificacao = email;
    res.redirect('/verificar-codigo');
    

  } catch (err) {
    console.error('Erro ao enviar código:', err);
    res.render('recuperar', {
      erro: 'Erro ao enviar e-mail. Tente novamente.',
      mensagem: null,
    });
  }
});

router.get('/verificar-codigo', (req, res) => {
  res.render('verificar-codigo', { erro: null });
});

router.post('/verificar-codigo', (req, res) => {
  const { codigo } = req.body;

  if (req.session.codigoVerificacao && req.session.codigoVerificacao.toString() === codigo.trim()) {
    return res.redirect('/nova-senha');
  }

  res.render('verificar-codigo', { erro: 'Código incorreto. Tente novamente.' });
});

router.get('/nova-senha', (req, res) => {
  res.render('nova-senha', { mensagem: null, erro: null });
});

router.post('/nova-senha', async (req, res) => {
  const { senha } = req.body;
  const email = req.session.emailVerificacao;

  try {
    const conexao = await conectarBD();
    await conexao.query('UPDATE usuario SET senha_usu = ? WHERE email_usu = ?', [senha, email]);

    // Limpa a sessão
    req.session.codigoVerificacao = null;
    req.session.emailVerificacao = null;

    return res.render('nova-senha', {
      mensagem: 'Senha atualizada com sucesso!',
      erro: null
    });

  } catch (erro) {
    console.error('Erro ao atualizar senha:', erro);
    return res.render('nova-senha', {
      mensagem: null,
      erro: 'Erro ao atualizar a senha. Tente novamente.'
    });
  }
});



module.exports = router;