const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { verificarEmailExiste, atualizarSenhaUsuario } = require('../banco');
const { conectarBD } = require('../banco');
const { logger } = require('../logger'); //->impoirt o logger

router.get('/recuperar', (req, res) => {
  logger.info(`[RECUPERAR] Usuário acessou página de recuperação de senha | IP: ${req.ip}`);
  res.render('recuperar', { erro: null, mensagem: null });
});

router.post('/recuperar', async (req, res) => {
  const { email } = req.body;

  logger.warn(`[RECUPERAR] Tentativa de recuperação de senha | Email: ${email} | IP: ${req.ip}`);

  try {
    const existe = await verificarEmailExiste(email);

    if (!existe) {
      logger.warn(`[RECUPERAR] E-mail não encontrado | Email: ${email} | IP: ${req.ip}`);
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

    logger.info(`[RECUPERAR] Código de verificação enviado | Email: ${email} | IP: ${req.ip}`);

    req.session = req.session || {};
    req.session.codigoVerificacao = codigo;
    req.session.emailVerificacao = email;
    res.redirect('/verificar-codigo');

  } catch (err) {
    logger.error(`[RECUPERAR] Erro ao enviar código de verificação | Email: ${email} | IP: ${req.ip} | Erro: ${err.message}`);
    res.render('recuperar', {
      erro: 'Erro ao enviar e-mail. Tente novamente.',
      mensagem: null,
    });
  }
});

router.get('/verificar-codigo', (req, res) => {
  logger.info(`[RECUPERAR] Usuário acessou página de verificação de código | IP: ${req.ip}`);
  res.render('verificar-codigo', { erro: null });
});

router.post('/verificar-codigo', (req, res) => {
  const { codigo } = req.body;

  logger.info(`[RECUPERAR] Tentativa de validação de código | Email: ${req.session.emailVerificacao} | Código digitado: ${codigo} | IP: ${req.ip}`);

  if (req.session.codigoVerificacao && req.session.codigoVerificacao.toString() === codigo.trim()) {
    logger.info(`[RECUPERAR] Código de verificação validado com sucesso | Email: ${req.session.emailVerificacao} | IP: ${req.ip}`);
    return res.redirect('/nova-senha');
  }

  logger.warn(`[RECUPERAR] Código de verificação incorreto | Email: ${req.session.emailVerificacao} | Código digitado: ${codigo} | IP: ${req.ip}`);
  res.render('verificar-codigo', { erro: 'Código incorreto. Tente novamente.' });
});

router.get('/nova-senha', (req, res) => {
  logger.info(`[RECUPERAR] Usuário acessou página de nova senha | Email: ${req.session.emailVerificacao} | IP: ${req.ip}`);
  res.render('nova-senha', { mensagem: null, erro: null });
});

router.post('/nova-senha', async (req, res) => {
  const { senha } = req.body;
  const email = req.session.emailVerificacao;

  logger.info(`[RECUPERAR] Tentativa de atualização de senha | Email: ${email} | IP: ${req.ip}`);

  try {
    const conexao = await conectarBD();
    await conexao.query('UPDATE usuario SET senha_usu = ? WHERE email_usu = ?', [senha, email]);

    req.session.codigoVerificacao = null;
    req.session.emailVerificacao = null;

    logger.info(`[RECUPERAR] Senha atualizada com sucesso | Email: ${email} | IP: ${req.ip}`);

    return res.render('nova-senha', {
      mensagem: 'Senha atualizada com sucesso!',
      erro: null
    });

  } catch (erro) {
    logger.error(`[RECUPERAR] Erro ao atualizar senha | Email: ${email} | IP: ${req.ip} | Erro: ${erro.message}`);
    return res.render('nova-senha', {
      mensagem: null,
      erro: 'Erro ao atualizar a senha. Tente novamente.'
    });
  }
});



module.exports = router;