const express = require("express");
const router = express.Router();
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
    return res.render("login", {
      title: "Login - ArtGallery",
      erros,
      sucesso: false,
    });
  }

  try {
    const usuario = await buscarUsuario({ email, senha });

    if (usuario) {
      // 🔒 VERIFICAÇÃO DE ARTISTA NÃO LIBERADO
      if (usuario.ban === true){
        return res.render("login", {
          title: "Login - ArtGallery",
          erros: "Este usuário está permanemente bloqueado.",
          sucesso: false,
        });
      }
      if (usuario.tipo_usu === "art") {
        const conexao = await conectarBD();
        const [[liberacao]] = await conexao.query(
          `
                    SELECT status_lib FROM liberacao_artista WHERE id_usu = ?
                `,
          [usuario.id_usu]
        );

        if (liberacao.status_lib !== "l") {
          return res.render("login", {
            title: "Login - ArtGallery",
            erros: "Seu cadastro como artista ainda não foi aprovado.",
            sucesso: false,
          });
        } else {
          const artista = await buscarArtistaPorIdUsu(usuario.id_usu);
          const dadosArtista = artista[0]; // porque a função retorna um array com 1 objeto

          req.session.usuario = {
            id_usu: dadosArtista.id_usu,
            nome_usu: dadosArtista.nome_usu,
            email_usu: usuario.email_usu, // ou dadosArtista.email
            tipo_usu: usuario.tipo_usu,
            id_art: dadosArtista.id_art,
          };

          console.log("Sessão após login:", req.session);
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
      }

      console.log("Sessão após login:", req.session);
      return res.render("login", {
        title: "Login - ArtGallery",
        erros: null,
        sucesso: true,
      });
    } else {
      return res.render("login", {
        title: "Login - ArtGallery",
        erros: "E-mail ou senha incorretos.",
        sucesso: false,
      });
    }
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return res.render("login", {
      title: "Login - ArtGallery",
      erros: "Erro no servidor, tente novamente.",
      sucesso: false,
    });
  }
});

module.exports = router;
