const express = require("express");
const router = express.Router();
const { logger } = require('../logger'); //->impoirt o logger
const {
  buscarUsuario,
  conectarBD,
  buscarArtistaPorIdUsu,
} = require("../banco");

// GET /login — permite acesso somente se o usuário não estiver logado
router.get("/", (req, res) => {
  if (req.session.usuario) return res.redirect("/");

  res.render("login", {
    title: "Login - ArtGallery",
    erros: null,
    sucesso: false,
  });
});

// POST /login — realiza a autenticação e exibe mensagem de sucesso se válido
router.post("/", async (req, res) => {
  const { email, senha } = req.body;
  let erros = null;

  if (!email || !senha) {
    erros = "E-mail e senha são obrigatórios!";
    logger.warn(`[LOGIN] Tentativa de login sem email/senha preenchidos | IP: ${req.ip}`);
    return res.render("login", {
      title: "Login - ArtGallery",
      erros,
      sucesso: false,
    });
  }

  try {
    logger.info(`[LOGIN] Tentativa de login | Email: ${email} | IP: ${req.ip}`);
    const usuario = await buscarUsuario({ email, senha });

    if (usuario) {
      if (usuario.ban === true){
        logger.warn(`[LOGIN] Bloqueado - usuário banido | Email: ${email} | ID: ${usuario.id_usu} | IP: ${req.ip}`);
        return res.render("login", {
          title: "Login - ArtGallery",
          erros: "Este usuário está permanemente bloqueado.",
          sucesso: false,
        });
      }
      if (usuario.tipo_usu === "art") {
        const conexao = await conectarBD();
        const [[liberacao]] = await conexao.query(
          `SELECT status_lib FROM liberacao_artista WHERE id_usu = ?`,
          [usuario.id_usu]
        );

        if (liberacao.status_lib !== "l") {
          logger.warn(`[LOGIN] Recusado - artista não liberado | Email: ${email} | ID: ${usuario.id_usu} | Status: ${liberacao.status_lib} | IP: ${req.ip}`);
          return res.render("login", {
            title: "Login - ArtGallery",
            erros: "Seu cadastro como artista ainda não foi aprovado.",
            sucesso: false,
          });
        } else {
          const artista = await buscarArtistaPorIdUsu(usuario.id_usu);
          const dadosArtista = artista[0];

          req.session.usuario = {
            id_usu: dadosArtista.id_usu,
            nome_usu: dadosArtista.nome_usu,
            email_usu: usuario.email_usu,
            tipo_usu: usuario.tipo_usu,
            id_art: dadosArtista.id_art,
          };

          logger.info(`[LOGIN] Sucesso (artista) | Email: ${email} | ID: ${usuario.id_usu} | IP: ${req.ip}`);
          return res.render("login", {
            title: "Login - ArtGallery",
            erros: null,
            sucesso: true,
          });
        }
      } else {
        req.session.usuario = {
          id_usu: usuario.id_usu,
          nome_usu: usuario.nome_usu,
          email_usu: usuario.email_usu,
          tipo_usu: usuario.tipo_usu,
        };
        logger.info(`[LOGIN] Sucesso | Email: ${email} | ID: ${usuario.id_usu} | Tipo: ${usuario.tipo_usu} | IP: ${req.ip}`);
      }

      return res.render("login", {
        title: "Login - ArtGallery",
        erros: null,
        sucesso: true,
      });
    } else {
      logger.warn(`[LOGIN] Falhou - email ou senha incorretos | Email: ${email} | IP: ${req.ip}`);
      return res.render("login", {
        title: "Login - ArtGallery",
        erros: "E-mail ou senha incorretos.",
        sucesso: false,
      });
    }
  } catch (error) {
    logger.error(`[LOGIN] Erro no login | Email: ${email} | IP: ${req.ip} | Erro: ${error.message}`);
    return res.render("login", {
      title: "Login - ArtGallery",
      erros: "Erro no servidor, tente novamente.",
      sucesso: false,
    });
  }
});

module.exports = router;
