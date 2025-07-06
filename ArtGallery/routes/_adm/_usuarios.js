const express = require("express");
const router = express.Router();
const {
  listarUsuarios,
  listarApreciadores,
  listarArtistasLiberados,
  listarArtistasAtivos,
  listarArtistasAguardandoLiberacao,
  listarAdministradores,
  listarUsuariosBanidos,
  buscarDadosUsuarioPorId,
  liberarArtista,
  advertirUsuario,
  banirUsuario
} = require("../../banco");

function validarPermissaoAdm(req, res) {
  if (!req.session.usuario) return res.redirect("/login");
  const tipo_usu = req.session.usuario.tipo_usu;
  if (tipo_usu !== "adm") return res.redirect("/");
}

// GET /adm/usuarios - Exibe a lista de usuários
router.get("/", async (req, res) => {
  validarPermissaoAdm(req, res);

  const usuarios = await listarUsuarios();

  res.render("_adm/_usuariosTotal", {
    usuario: req.session.usuario,
    title: "Usuários - ArtGallery",
    usuarios: usuarios.map((u) => ({
      id: u.id,
      usu: u.usu,
      nome: u.nome,
      bio: u.bio,     
      email: u.email,
      foto: u.foto,
      tipo: u.tipo,
      adv: u.adv,
      ban: u.ban,
      tabela: "usuario",
    })),
  });
});

router.get("/apreciadores", async (req, res) => {
  validarPermissaoAdm(req, res);

  const usuarios = await listarApreciadores();

  res.render("_adm/_usuariosTotal", {
    usuario: req.session.usuario,
    title: "Apreciadores - ArtGallery",
    usuarios: usuarios.map((u) => ({
      id: u.id,
      usu: u.usu,
      nome: u.nome,
      bio: u.bio,
      email: u.email,
      foto: u.foto,
      tipo: u.tipo,
      adv: u.adv,
      ban: u.ban,
      tabela: "usuario",
    })),
  });
});

router.get("/artistas/ativos", async (req, res) => {
    validarPermissaoAdm(req, res);

    const usuarios = await listarArtistasAtivos();
    res.render("_adm/_usuariosTotal", {
        usuario: req.session.usuario,
        title: "Artistas Liberados - ArtGallery",
        usuarios: usuarios.map((u) => ({
        id: u.id,
        usu: u.usu,
        nome: u.nome,
        bio: u.bio,  
        email: u.email || null,
        foto: u.foto,
        tipo: u.tipo || null,
        adv: u.adv || null,
        ban: u.ban || null,
        tabela: "artista",
        })),
    });
})

router.get("/artistas/liberados", async (req, res) => {
  validarPermissaoAdm(req, res);

  const usuarios = await listarArtistasLiberados();

  res.render("_adm/_usuariosTotal", {
    usuario: req.session.usuario,
    title: "Artistas Liberados - ArtGallery",
    usuarios: usuarios.map((u) => ({
      id: u.id,
      usu: u.usu,
      nome: u.nome,
      bio: u.bio,
      email: u.email,
      foto: u.foto,
      tipo: u.tipo,
      adv: u.adv,
      ban: u.ban,
      tabela: "artista",
    })),
  });
});

router.get("/artistas/pendentes", async (req, res) => {
  validarPermissaoAdm(req, res);

  const usuarios = await listarArtistasAguardandoLiberacao();

  res.render("_adm/_usuariosTotal", {
    usuario: req.session.usuario,
    title: "Artistas Pendentes - ArtGallery",
    usuarios: usuarios.map((u) => ({
      id: u.id,
      usu: u.usu,
      nome: u.nome,
      bio: u.bio,
      email: u.email,
      foto: u.foto,
      tipo: u.tipo,
      adv: u.adv,
      ban: u.ban,
      tabela: "artista",
    })),
  });
});

router.get("/administradores", async (req, res) => {
  validarPermissaoAdm(req, res);

  const usuarios = await listarAdministradores();

  res.render("_adm/_usuariosTotal", {
    usuario: req.session.usuario,
    title: "Administradores - ArtGallery",
    usuarios: usuarios.map((u) => ({
      id: u.id,
      usu: u.usu,
      nome: u.nome,
      bio: u.bio,
      email: u.email,
      foto: u.foto,
      tipo: u.tipo,
      adv: u.adv,
      ban: u.ban,
      tabela: "usuario",
    })),
  });
});

router.get("/banidos", async (req, res) => {
  validarPermissaoAdm(req, res);

  const usuarios = await listarUsuariosBanidos();

  res.render("_adm/_usuariosTotal", {
    usuario: req.session.usuario,
    title: "Banidos - ArtGallery",
    usuarios: usuarios.map((u) => ({
      id: u.id,
      usu: u.usu,
      nome: u.nome,
      bio: u.bio,
      email: u.email,
      foto: u.foto,
      tipo: u.tipo,
      adv: u.adv,
      ban: u.ban,
      tabela: "usuario",
    })),
  });
});

// Funções de editar/liberar/advertir/banir
router.get("/editar/:id", async (req, res) => {
  validarPermissaoAdm(req, res);

  const usuario = await buscarDadosUsuarioPorId(req.params.id);
  res.render("_adm/_usuarioEditar", {
    usuarioLogado: req.session.usuario,
    usuario,
    title: "Editar Usuário",
  });
});

router.post("/editar/:id", async (req, res) => {
  validarPermissaoAdm(req, res);

  // Aqui você implementaria a lógica para atualizar os dados do usuário
  // Exemplo: await atualizarUsuario(req.params.id, req.body);
  
  req.flash("success", "Usuário atualizado com sucesso");
  res.redirect("/adm/usuarios");
});

router.get("/liberacao/:id", async (req, res) => {
  validarPermissaoAdm(req, res);

  try {
    await liberarArtista(req.params.id);
    req.flash("success", "Artista liberado com sucesso");
  } catch (error) {
    req.flash("error", "Erro ao liberar artista");
  }
  
  res.redirect("/adm/usuarios/artistas/pendentes");
});

router.post("/liberacao/:id", async (req, res) => {
  validarPermissaoAdm(req, res);

  try {
    await liberarArtista(req.params.id);
    req.flash("success", "Artista liberado com sucesso");
  } catch (error) {
    req.flash("error", "Erro ao liberar artista");
  }
  
  res.redirect("/adm/usuarios/artistas/pendentes");
});

router.get("/advertir/:id", async (req, res) => {
  validarPermissaoAdm(req, res);

  try {
    await advertirUsuario(req.params.id);
    req.flash("success", "Usuário advertido com sucesso");
  } catch (error) {
    req.flash("error", "Erro ao advertir usuário");
  }
  
  res.redirect("/adm/usuarios");
});

router.post("/advertir/:id", async (req, res) => {
  validarPermissaoAdm(req, res);

  try {
    await advertirUsuario(req.params.id);
    req.flash("success", "Usuário advertido com sucesso");
  } catch (error) {
    req.flash("error", "Erro ao advertir usuário");
  }
  
  res.redirect("/adm/usuarios");
});

router.get("/banir/:id", async (req, res) => {
  validarPermissaoAdm(req, res);

  try {
    await banirUsuario(req.params.id);
    req.flash("success", "Usuário banido com sucesso");
  } catch (error) {
    req.flash("error", "Erro ao banir usuário");
  }
  
  res.redirect("/adm/usuarios");
});

router.post("/banir/:id", async (req, res) => {
  validarPermissaoAdm(req, res);

  try {
    await banirUsuario(req.params.id);
    req.flash("success", "Usuário banido com sucesso");
  } catch (error) {
    req.flash("error", "Erro ao banir usuário");
  }
  
  res.redirect("/adm/usuarios");
});

module.exports = router;