// routes/perfil.js
const express = require("express");
const router = express.Router();
const { buscarUsuario, buscarObrasFavoritas, buscarDadosUsuarioPorId } = require("../banco"); // <- ajuste aqui
//const autenticado = require('../middlewares/autenticado');

router.get("/", async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }
  try {
    const usuario = req.session.usuario;
    // Aqui você pode buscar mais informações do usuário, se necessário
    res.render("perfil", {
      title: "Perfil - ArtGallery",
      usuario: usuario,
      // Adicione outras informações que deseja exibir no perfil
    });
  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
    res.status(500).send("Erro ao carregar perfil");
  }
});

router.get('/', async (req, res) => {
  try {
    const usuarioId = req.session.usuario.id;
    const usuario = await buscarDadosUsuarioPorId(usuarioId);

    if (!usuario) {
      return res.redirect('/login');
    }

    res.render('perfil', { usuario });

  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao carregar perfil');
  }
});
router.post('/', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await buscarDadosUsuario({ email, senha });

    if (!usuario) {
      return res.render('login', { erro: 'Credenciais inválidas' });
    }

    // ✅ Salvar usuário na sessão
    req.session.usuario = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      // outros campos se necessário
    };

    res.redirect('/perfil');
  } catch (error) {
    console.error(error);
    res.render('login', { erro: 'Erro ao processar login' });
  }
});

router.get("/:id", async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }
  const usuarioId = req.params.id;
  try {
    // Aqui você pode buscar informações específicas do usuário pelo ID
    const usuario = await buscarUsuario(usuarioId); // Implemente essa função no banco
    if (!usuario) {
      return res.status(404).send("Usuário não encontrado");
    }
    res.render("perfil", {
      title: `Perfil de ${usuario.nome} - ArtGallery`,
      usuario: usuario,
      // Adicione outras informações que deseja exibir no perfil
    });
  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
    res.status(500).send("Erro ao carregar perfil");
  }
});

router.get("/", async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }

  try {
    const usuario = req.session.usuario;
    const obrasFavoritas = await buscarObrasFavoritas(usuario.id_usu);

    res.render("favoritos", {
      title: "Favoritos – ArtGallery",
      usuario,
      obras: obrasFavoritas.map(o => ({
        id: o.id,
        nome: o.nome,
        art: o.art,
        foto: o.foto,
        tabela: "obra"
      }))
    });
  } catch (err) {
    console.error("Erro ao carregar obras favoritas:", err);
    res.status(500).send("Erro ao carregar favoritos");
  }
});

module.exports = router;