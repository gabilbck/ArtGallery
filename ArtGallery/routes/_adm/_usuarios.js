const express = require("express");
const router = express.Router();
const { logger } = require('../../logger'); //->impoirt o logger
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
  if (!req.session.usuario) {
    logger.warn(`[ADM_USUARIOS] Tentativa de acesso sem login | IP: ${req.ip}`);
    return res.redirect("/login");
  }
  const tipo_usu = req.session.usuario.tipo_usu;
  if (tipo_usu !== "adm") {
    logger.warn(`[ADM_USUARIOS] Tentativa de acesso sem permissão de administrador | UsuarioID: ${req.session.usuario.id_usu} | Tipo: ${tipo_usu} | IP: ${req.ip}`);
    return res.redirect("/");
  }
}

// GET /adm/usuarios - Exibe a lista de usuários
router.get("/", async (req, res) => {
  validarPermissaoAdm(req, res);
  logger.info(`[ADM_USUARIOS] Administrador acessou lista de todos os usuários | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);

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
  logger.info(`[ADM_USUARIOS] Administrador acessou lista de apreciadores | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);

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
    logger.info(`[ADM_USUARIOS] Administrador acessou lista de artistas ativos | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);

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
  logger.info(`[ADM_USUARIOS] Administrador acessou lista de artistas liberados | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);

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
      status: u.status,
      tabela: "artista",
    })),
  });
});

router.get("/artistas/pendentes", async (req, res) => {
  validarPermissaoAdm(req, res);
  logger.info(`[ADM_USUARIOS] Administrador acessou lista de artistas pendentes | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);

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
      status: u.status,
      tabela: "artista",
    })),
  });
});

router.get("/administradores", async (req, res) => {
  validarPermissaoAdm(req, res);
  logger.info(`[ADM_USUARIOS] Administrador acessou lista de administradores | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);

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
  logger.info(`[ADM_USUARIOS] Administrador acessou lista de usuários banidos | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);

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
  logger.info(`[ADM_USUARIOS] Administrador acessou edição de usuário | EditadoID: ${req.params.id} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);

  const usuario = await buscarDadosUsuarioPorId(req.params.id);
  res.render("_adm/_usuarioEditar", {
    usuarioLogado: req.session.usuario,
    usuario,
    title: "Editar Usuário",
  });
});

router.post("/liberar/:id", async (req, res) => {
  validarPermissaoAdm(req, res);
  try {
    await liberarArtista(req.params.id);
    logger.info(`[ADM_USUARIOS] Administrador liberou artista | ArtistaID: ${req.params.id} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
    res.redirect("/adm/usuarios");
  } catch (error) {
    logger.error(`[ADM_USUARIOS] Erro ao liberar artista | ArtistaID: ${req.params.id} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip} | Erro: ${error.message}`);
    res.redirect("/adm/usuarios");
  }
});

router.post("/advertir/:id", async (req, res) => {
  validarPermissaoAdm(req, res);
  try {
    await advertirUsuario(req.params.id);
    logger.info(`[ADM_USUARIOS] Administrador advertiu usuário | AdvertidoID: ${req.params.id} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
    res.redirect("/adm/usuarios");
  } catch (error) {
    logger.error(`[ADM_USUARIOS] Erro ao advertir usuário | AdvertidoID: ${req.params.id} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip} | Erro: ${error.message}`);
    res.redirect("/adm/usuarios");
  }
});

router.post("/banir/:id", async (req, res) => {
  validarPermissaoAdm(req, res);
  try {
    await banirUsuario(req.params.id);
    logger.info(`[ADM_USUARIOS] Administrador baniu usuário | BanidoID: ${req.params.id} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
    res.redirect("/adm/usuarios");
  } catch (error) {
    logger.error(`[ADM_USUARIOS] Erro ao banir usuário | BanidoID: ${req.params.id} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip} | Erro: ${error.message}`);
    res.redirect("/adm/usuarios");
  }
});

module.exports = router;