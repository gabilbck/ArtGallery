const express = require("express");
const router = express.Router();
const { logger } = require('../logger'); 
const {
  buscarUsuario,
  conectarBD,
  buscarArtistaPorIdUsu,
} = require("../banco");

// Objeto para rastrear tentativas de login por IP
const tentativasLogin = {};

// Tempo de expiração das tentativas em ms (ex.: 15 minutos)
const TEMPO_EXPIRACAO = 15 * 60 * 1000;

// GET /login
router.get("/", (req, res) => {
  if (req.session.usuario) return res.redirect("/");

  res.render("login", {
    title: "Login - ArtGallery",
    erros: null,
    sucesso: false,
  });
});

// POST /login
router.post("/", async (req, res) => {
  const { email, senha } = req.body;
  let erros = null;
  const ip = req.ip;

  if (!email || !senha) {
    logger.warn(`[LOGIN] Tentativa de login sem email/senha preenchidos | IP: ${ip}`);
    return res.render("login", {
      title: "Login - ArtGallery",
      erros: "E-mail e senha são obrigatórios!",
      sucesso: false,
    });
  }

  try {
    logger.info(`[LOGIN] Tentativa de login | Email: ${email} | IP: ${ip}`);

    const usuario = await buscarUsuario({ email, senha });

    if (usuario) {
      // Limpa o contador de tentativas em caso de sucesso
      if (tentativasLogin[ip]) delete tentativasLogin[ip];

      // ... aqui segue toda a lógica atual de usuário banido, artista, etc.
      if (usuario.ban === true) {
        logger.warn(`[LOGIN] Bloqueado - usuário banido | Email: ${email} | ID: ${usuario.id_usu} | IP: ${ip}`);
        return res.render("login", {
          title: "Login - ArtGallery",
          erros: "Este usuário está permanentemente bloqueado.",
          sucesso: false,
        });
      }

      // ... resto da lógica de login bem-sucedido
      req.session.usuario = {
        id_usu: usuario.id_usu,
        nome_usu: usuario.nome_usu,
        email_usu: usuario.email_usu,
        tipo_usu: usuario.tipo_usu,
      };
      logger.info(`[LOGIN] Sucesso | Email: ${email} | ID: ${usuario.id_usu} | Tipo: ${usuario.tipo_usu} | IP: ${ip}`);

      return res.render("login", {
        title: "Login - ArtGallery",
        erros: null,
        sucesso: true,
      });
    } else {
      // Incrementa tentativas
      if (!tentativasLogin[ip]) {
        tentativasLogin[ip] = { count: 1, firstAttempt: Date.now() };
      } else {
        tentativasLogin[ip].count += 1;
      }

      // Remove tentativas antigas
      if (Date.now() - tentativasLogin[ip].firstAttempt > TEMPO_EXPIRACAO) {
        tentativasLogin[ip] = { count: 1, firstAttempt: Date.now() };
      }

      // Emitir alerta se passar de 3 tentativas
      if (tentativasLogin[ip].count > 3) {
        logger.warn(`[LOGIN] ALERTA - Mais de 3 tentativas de login falhas | IP: ${ip} | Email: ${email}`);
      }

      logger.warn(`[LOGIN] Falhou - email ou senha incorretos | Email: ${email} | IP: ${ip}`);

      return res.render("login", {
        title: "Login - ArtGallery",
        erros: "E-mail ou senha incorretos.",
        sucesso: false,
      });
    }
  } catch (error) {
    logger.error(`[LOGIN] Erro no login | Email: ${email} | IP: ${ip} | Erro: ${error.message}`);
    return res.render("login", {
      title: "Login - ArtGallery",
      erros: "Erro no servidor, tente novamente.",
      sucesso: false,
    });
  }
});

module.exports = router;
