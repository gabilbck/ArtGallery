const express = require("express");
const router = express.Router();
const {
  buscarDadosUsuarioPorId,
  buscarColecaoPorUsu,
  buscarObrasPorColecao,
  criarColecao,
  excluirColecao,
  atualizarColecao,
  adicionarObraColecao,
  excluirObraColecao,
} = require("../banco");
const { logger } = require('../logger'); // Adiciona o logger

// Redireciona para as coleções do usuário
router.get("/", async (req, res) => {
  if (!req.session.usuario) {
    logger.warn(`[COLECAO] Tentativa de acesso sem login | IP: ${req.ip}`);
    return res.redirect("/login");
  }
  const id_usu = req.session.usuario.id_usu;
  logger.info(`[COLECAO] Redirecionando para coleções do usuário | UsuarioID: ${id_usu} | IP: ${req.ip}`);
  res.redirect(`/colecao/verTodas/${id_usu}`);
});

// Página que exibe todas as coleções do usuário
router.get("/verTodas/:id_usu", async (req, res) => {
  if (!req.session.usuario) {
    logger.warn(`[COLECAO] Tentativa de acesso sem login | IP: ${req.ip}`);
    return res.redirect("/login");
  }
  const id_usu = req.session.usuario.id_usu;
  const nome_usu = req.session.usuario.nome_usu;
  logger.info(`[COLECAO] Usuário acessou lista de coleções | UsuarioID: ${id_usu} | IP: ${req.ip}`);
  try {
    const usu = buscarDadosUsuarioPorId(id_usu);
    const colecoes = await buscarColecaoPorUsu(id_usu);
    if (!colecoes) {
      logger.warn(`[COLECAO] Nenhuma coleção encontrada | UsuarioID: ${id_usu} | IP: ${req.ip}`);
      return res.redirect("/colecao/criar");
    }
    if (!colecoes || colecoes.length === 0) {
      logger.info(`[COLECAO] Usuário sem coleções, redirecionando para criação | UsuarioID: ${id_usu} | IP: ${req.ip}`);
      return res.redirect("/colecao/criarColecao");
    }

    const erros = req.session.erro || null;
    const sucesso = req.session.sucesso || null;
    delete req.session.erro;
    delete req.session.sucesso;

    logger.info(`[COLECAO] Coleções carregadas | UsuarioID: ${id_usu} | Quantidade: ${colecoes.length} | IP: ${req.ip}`);
    res.render("colecoes", {
      colecoes: colecoes.map((c) => ({
        id: c.id_colecao,
        id_usu: c.id_usu,
        nome: c.nome_colecao,
        foto: c.foto_obra || "/uploads/imagem.png",
      })),
      id_usu,
      nome_usu,
      title: `Coleções de ${nome_usu}`,
      erros,
      sucesso,
    });
  } catch (err) {
    logger.error(`[COLECAO] Erro ao buscar coleções | UsuarioID: ${id_usu} | IP: ${req.ip} | Erro: ${err.message}`);
    res.status(500).send("Erro ao buscar coleções");
  }
});

// Página de visualização de uma coleção específica
router.get("/ver/:id", async (req, res) => {
  if (!req.session.usuario) {
    logger.warn(`[COLECAO] Tentativa de acesso sem login | IP: ${req.ip}`);
    return res.redirect("/login");
  }

  const id_col = req.params.id;
  logger.info(`[COLECAO] Usuário acessou coleção | ColecaoID: ${id_col} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);

  try {
    const obras = await buscarObrasPorColecao(id_col);
    let colecao;

    if (obras && obras.length > 0 && obras[0].id_col) {
      colecao = {
        id_col: obras[0].id_col,
        nome_colecao: obras[0].nome_colecao,
        nome_usuario: obras[0].nome_usuario,
      };
    } else {
      const todasColecoes = await buscarColecaoPorUsu(
        req.session.usuario.id_usu
      );
      colecao = todasColecoes.find((c) => c.id_col == id_col);

      if (!colecao) {
        logger.warn(`[COLECAO] Coleção não encontrada | ColecaoID: ${id_col} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
        return res.status(404).send("Coleção não encontrada.");
      }

      colecao = {
        id_col: colecao.id_col,
        nome_colecao: colecao.nome_col,
        nome_usuario: req.session.usuario.nome_usu,
      };
    }

    logger.info(`[COLECAO] Dados carregados para coleção | ColecaoID: ${id_col} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
    res.render("colecaoID", {
      colecao,
      obras,
      usuario: req.session.usuario,
      title: "Detalhes da Coleção",
      erros: req.session.erro || null,
      sucesso: req.session.sucesso || null,
    });

    delete req.session.erro;
    delete req.session.sucesso;
  } catch (err) {
    logger.error(`[COLECAO] Erro ao carregar a coleção | ColecaoID: ${id_col} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip} | Erro: ${err.message}`);
    res.status(500).send("Erro ao carregar a coleção.");
  }
});

router.get("/criarColecao", async (req, res) => {
  if (!req.session.usuario) {
    logger.warn(`[COLECAO] Tentativa de acesso sem login | IP: ${req.ip}`);
    return res.redirect("/login");
  }

  logger.info(`[COLECAO] Usuário acessou página de criação de coleção | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);

  const sucesso = req.session.sucesso || null;
  const erro = req.session.erro || null;
  const id_col = req.session.id_col || null;
  const msg_criacao = req.session.msg_criacao || null;

  delete req.session.sucesso;
  delete req.session.erro;
  delete req.session.id_col;
  delete req.session.msg_criacao;

  res.render("criarColecao", {
    nome_usu: req.session.usuario.nome_usu,
    title: "Criar nova coleção",
    sucesso,
    msg_criacao,
    erros: erro,
    id_col
  });
});

router.get("/adicionarObra/:id_col", async (req, res) => {
  if (!req.session.usuario) {
    logger.warn(`[COLECAO] Tentativa de acesso sem login | IP: ${req.ip}`);
    return res.redirect("/login");
  }

  const id_col = req.params.id_col;
  const id_obr = req.query.obra;
  const id_usu = req.session.usuario.id_usu;
  const nome_usu = req.session.usuario.nome_usu;

  logger.info(`[COLECAO] Usuário acessou página para adicionar obra à coleção | ColecaoID: ${id_col} | ObraID: ${id_obr} | UsuarioID: ${id_usu} | IP: ${req.ip}`);

  if (!id_obr || isNaN(id_obr)) {
    logger.warn(`[COLECAO] ID da obra ausente ou inválido | ObraID: ${id_obr} | UsuarioID: ${id_usu} | IP: ${req.ip}`);
    req.session.erro = "ID da obra ausente ou inválido.";
    return res.redirect("/colecao/verTodas/" + id_usu);
  }

  const verificarColecoesExistentes = await buscarColecaoPorUsu(id_usu);
  if (!verificarColecoesExistentes || verificarColecoesExistentes.length === 0) {
    logger.warn(`[COLECAO] Usuário sem coleções para adicionar obras | UsuarioID: ${id_usu} | IP: ${req.ip}`);
    req.session.erro = "Você não possui coleções para adicionar obras.";
    return res.redirect("/colecao/criarColecao");
  }

  try {
    const colecoes = verificarColecoesExistentes.map((c) => ({
      id: c.id_colecao,
      nome: c.nome_colecao,
      foto: c.foto_obra || '/uploads/imagem.png'
    }));

    logger.info(`[COLECAO] Coleções carregadas para seleção | UsuarioID: ${id_usu} | Quantidade: ${colecoes.length} | IP: ${req.ip}`);
    res.render("selecionarColecao", {
      id_col,
      id_obr,
      nome_usu,
      id_usu,
      colecoes,
      usuario: req.session.usuario,
      title: "Adicionar Obra à Coleção",
      erros: req.session.erro || null,
      sucesso: req.session.sucesso || null,
    });

    delete req.session.erro;
    delete req.session.sucesso;
  } catch (err) {
    logger.error(`[COLECAO] Erro ao carregar coleções para seleção | UsuarioID: ${id_usu} | IP: ${req.ip} | Erro: ${err.message}`);
    res.status(500).send("Erro ao carregar coleções.");
  }
});

router.post("/adicionarObra", async (req, res) => {
  if (!req.session.usuario) {
    logger.warn(`[COLECAO] Tentativa de adicionar obra sem login | IP: ${req.ip}`);
    return res.redirect("/login");
  }
  const { id_col, id_obr } = req.body;
  const id_usu = req.session.usuario.id_usu;
  const nome_usu = req.session.usuario.nome_usu;
  const verificarColecoesExistentes = await buscarColecaoPorUsu(id_usu);

  if (!verificarColecoesExistentes || verificarColecoesExistentes.length === 0) {
    logger.warn(`[COLECAO] Usuário sem coleções para adicionar obras | UsuarioID: ${id_usu} | IP: ${req.ip}`);
    req.session.erro = "Você não possui coleções para adicionar obras.";
    return res.redirect("/colecao/criarColecao");
  }
  if (!id_col || isNaN(id_col) || !id_obr || isNaN(id_obr)) {
    logger.warn(`[COLECAO] IDs inválidos para adicionar obra | ColecaoID: ${id_col} | ObraID: ${id_obr} | UsuarioID: ${id_usu} | IP: ${req.ip}`);
    req.session.erro = "IDs inválidos.";
    return res.redirect(`/colecao/adicionarObra/${id_col}`);
  }
  try {
    await adicionarObraColecao(id_col, id_obr);
    logger.info(`[COLECAO] Obra adicionada à coleção | ColecaoID: ${id_col} | ObraID: ${id_obr} | UsuarioID: ${id_usu} | IP: ${req.ip}`);
    req.session.sucesso = "Obra adicionada à coleção com sucesso!";
    res.redirect(`/colecao/ver/${id_col}`);
  } catch (err) {
    logger.error(`[COLECAO] Erro ao adicionar obra à coleção | ColecaoID: ${id_col} | ObraID: ${id_obr} | UsuarioID: ${id_usu} | IP: ${req.ip} | Erro: ${err.message}`);
    req.session.erro = "Erro ao adicionar obra à coleção.";
    res.redirect(`/colecao/adicionarObra/${id_col}`);
  }
});

router.post("/criarColecao", async (req, res) => {
  if (!req.session.usuario) {
    logger.warn(`[COLECAO] Tentativa de criar coleção sem login | IP: ${req.ip}`);
    return res.redirect("/login");
  }

  const id_usu = req.session.usuario.id_usu;
  const nome_col = req.body.nome_col;

  logger.info(`[COLECAO] Tentativa de criar coleção | UsuarioID: ${id_usu} | Nome: ${nome_col} | IP: ${req.ip}`);

  if (!nome_col || nome_col.trim().length === 0) {
    logger.warn(`[COLECAO] Nome da coleção vazio | UsuarioID: ${id_usu} | IP: ${req.ip}`);
    req.session.erro = "Nome da coleção não pode ser vazio.";
    return res.redirect("/colecao/criarColecao");
  }

  try {
    const id_col = await criarColecao(id_usu, nome_col.trim());
    logger.info(`[COLECAO] Coleção criada com sucesso | ColecaoID: ${id_col} | UsuarioID: ${id_usu} | IP: ${req.ip}`);
    req.session.sucesso = "Coleção criada com sucesso!";
    req.session.id_col = id_col;
    return res.redirect("/colecao/criarColecao");
  } catch (err) {
    logger.error(`[COLECAO] Erro ao criar coleção | UsuarioID: ${id_usu} | IP: ${req.ip} | Erro: ${err.message}`);
    req.session.erro = "Erro ao criar coleção.";
    return res.redirect("/colecao/criarColecao");
  }
});

// Atualizar nome da coleção
router.post("/atualizarColecao", async (req, res) => {
  if (!req.session.usuario) {
    logger.warn(`[COLECAO] Tentativa de atualizar coleção sem login | IP: ${req.ip}`);
    return res.redirect("/login");
  }

  const { id_col, novo_nome } = req.body;

  logger.info(`[COLECAO] Tentativa de atualizar nome da coleção | ColecaoID: ${id_col} | NovoNome: ${novo_nome} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);

  if (!novo_nome || novo_nome.trim() === "") {
    logger.warn(`[COLECAO] Nome da coleção vazio ao atualizar | ColecaoID: ${id_col} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
    req.session.erro = "O nome da coleção não pode ser vazio.";
    return res.redirect(`/colecao/ver/${id_col}`);
  }

  try {
    await atualizarColecao(id_col, novo_nome.trim());
    logger.info(`[COLECAO] Nome da coleção atualizado com sucesso | ColecaoID: ${id_col} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
    req.session.sucesso = "Nome da coleção atualizado com sucesso!";
    res.redirect(`/colecao/ver/${id_col}`);
  } catch (err) {
    logger.error(`[COLECAO] Erro ao atualizar nome da coleção | ColecaoID: ${id_col} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip} | Erro: ${err.message}`);
    req.session.erro = "Erro ao atualizar nome da coleção.";
    res.redirect(`/colecao/ver/${id_col}`);
  }
});

// Excluir coleção
router.post("/excluirColecao", async (req, res) => {
  if (!req.session.usuario) {
    logger.warn(`[COLECAO] Tentativa de excluir coleção sem login | IP: ${req.ip}`);
    return res.redirect("/login");
  }

  const { id_col } = req.body;
  const id_usu_logado = req.session.usuario.id_usu;

  logger.info(`[COLECAO] Tentativa de excluir coleção | ColecaoID: ${id_col} | UsuarioID: ${id_usu_logado} | IP: ${req.ip}`);

  try {
    const colecoesDoUsuario = await buscarColecaoPorUsu(id_usu_logado);
    const existe = colecoesDoUsuario.some((c) => c.id_colecao == id_col);

    if (!existe) {
      logger.warn(`[COLECAO] Usuário tentou excluir coleção que não possui | ColecaoID: ${id_col} | UsuarioID: ${id_usu_logado} | IP: ${req.ip}`);
      req.session.erro = "Você não tem permissão para excluir essa coleção.";
      return res.redirect(`/colecao/verTodas/${id_usu_logado}`);
    }

    await excluirColecao(id_col);

    const colecoesRestantes = await buscarColecaoPorUsu(id_usu_logado);
    if (!colecoesRestantes || colecoesRestantes.length === 0) {
      logger.info(`[COLECAO] Usuário ficou sem coleções após exclusão | UsuarioID: ${id_usu_logado} | IP: ${req.ip}`);
      req.session.msg_criacao = "Você ainda não tem coleções. Crie uma nova.";
      return res.redirect("/colecao/criarColecao");
    }

    logger.info(`[COLECAO] Coleção excluída com sucesso | ColecaoID: ${id_col} | UsuarioID: ${id_usu_logado} | IP: ${req.ip}`);
    req.session.sucesso = "Coleção excluída com sucesso!";
    res.redirect(`/colecao/verTodas/${id_usu_logado}`);
  } catch (err) {
    logger.error(`[COLECAO] Erro ao excluir coleção | ColecaoID: ${id_col} | UsuarioID: ${id_usu_logado} | IP: ${req.ip} | Erro: ${err.message}`);
    req.session.erro = "Erro ao excluir coleção.";
    res.redirect(`/colecao/verTodas/${id_usu_logado}`);
  }
});

// Excluir uma obra da coleção
router.post("/excluirObra", async (req, res) => {
  if (!req.session.usuario) {
    logger.warn(`[COLECAO] Tentativa de excluir obra sem login | IP: ${req.ip}`);
    return res.redirect("/login");
  }

  const { id_col, id_obr } = req.body;

  logger.info(`[COLECAO] Tentativa de excluir obra da coleção | ColecaoID: ${id_col} | ObraID: ${id_obr} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);

  try {
    await excluirObraColecao(id_col, id_obr);
    logger.info(`[COLECAO] Obra removida da coleção com sucesso | ColecaoID: ${id_col} | ObraID: ${id_obr} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
    req.session.sucesso = "Obra removida da coleção com sucesso!";
    res.redirect(`/colecao/ver/${id_col}`);
  } catch (err) {
    logger.error(`[COLECAO] Erro ao excluir obra da coleção | ColecaoID: ${id_col} | ObraID: ${id_obr} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip} | Erro: ${err.message}`);
    req.session.erro = "Erro ao excluir obra da coleção.";
    res.redirect(`/colecao/ver/${id_col}`);
  }
});

router.get("/adicionarObraDireto", async (req, res) => {
  if (!req.session.usuario) {
    logger.warn(`[COLECAO] Tentativa de adicionar obra sem login | IP: ${req.ip}`);
    return res.redirect("/login");
  }

  const { id_col, id_obr } = req.query;
  const id_usu = req.session.usuario.id_usu;

  logger.info(`[COLECAO] Usuário acessou adicionar obra direto | ColecaoID: ${id_col} | ObraID: ${id_obr} | UsuarioID: ${id_usu} | IP: ${req.ip}`);

  if (!id_col || !id_obr || isNaN(id_col) || isNaN(id_obr)) {
    logger.warn(`[COLECAO] ID de coleção ou obra inválido | ColecaoID: ${id_col} | ObraID: ${id_obr} | UsuarioID: ${id_usu} | IP: ${req.ip}`);
    req.session.erro = "ID de coleção ou obra inválido.";
    return res.redirect(`/colecao/verTodas/${id_usu}`);
  }

  try {
    await adicionarObraColecao(id_col, id_obr);
    logger.info(`[COLECAO] Obra adicionada à coleção com sucesso | ColecaoID: ${id_col} | ObraID: ${id_obr} | UsuarioID: ${id_usu} | IP: ${req.ip}`);
    req.session.sucesso = "Obra adicionada com sucesso!";
    res.redirect(`/colecao/ver/${id_col}`);
  } catch (err) {
    logger.error(`[COLECAO] Erro ao adicionar obra à coleção | ColecaoID: ${id_col} | ObraID: ${id_obr} | UsuarioID: ${id_usu} | IP: ${req.ip} | Erro: ${err.message}`);
    req.session.erro = "Erro ao adicionar obra à coleção.";
    res.redirect(`/colecao/ver/${id_col}`);
  }
});

module.exports = router;
