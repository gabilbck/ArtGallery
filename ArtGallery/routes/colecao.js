const express = require("express");
const router = express.Router();
const {
  buscarColecaoPorUsu,
  buscarObrasPorColecao,
  criarColecao,
  excluirColecao,
  atualizarColecao,
  adicionarObraColecao,
  excluirObraColecao,
} = require("../banco");

// Redireciona para as coleções do usuário
router.get("/", async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }
  const id_usu = req.session.usuario.id_usu;
  res.redirect(`/colecao/verTodas/${id_usu}`);
});

// Página que exibe todas as coleções do usuário
router.get("/verTodas/:id_usu", async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }
  const id_usu = req.session.usuario.id_usu;
  const nome_usu = req.session.usuario.nome_usu;

  try {
    const colecoes = await buscarColecaoPorUsu(id_usu);
    if (!colecoes || colecoes.length === 0) {
      return res.redirect("/colecao/criar");
    }

    const erros = req.session.erro || null;
    const sucesso = req.session.sucesso || null;
    delete req.session.erro;
    delete req.session.sucesso;

    res.render("colecoes", {
    colecoes: colecoes.map(c => ({
      id: c.id_colecao,
      nome: c.nome_colecao,
      foto: c.foto_obra || "imagem.png" // ou ajuste o caminho conforme seu sistema de uploads
    })),
    id_usu,
    nome_usu,
    title: `Coleções de ${nome_usu}`,
    erros,
    sucesso,
  });
  } catch (err) {
    console.error("Erro ao buscar coleções:", err);
    res.status(500).send("Erro ao buscar coleções");
  }
});

// Página de visualização de uma coleção específica
router.get("/ver/:id", async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }

  const id_col = req.params.id;

  try {
    const obras = await buscarObrasPorColecao(id_col);
    let colecao;

    if (obras && obras.length > 0 && obras[0].id_col) {
      // Caso haja pelo menos uma obra, pega as infos da coleção a partir das obras
      colecao = {
        id_col: obras[0].id_col,
        nome_colecao: obras[0].nome_colecao,
        nome_usuario: obras[0].nome_usuario,
      };
    } else {
      // Caso a coleção esteja vazia, buscar infos básicas só da coleção
      const todasColecoes = await buscarColecaoPorUsu(req.session.usuario.id_usu);
      colecao = todasColecoes.find(c => c.id_col == id_col);

      if (!colecao) {
        return res.status(404).send("Coleção não encontrada.");
      }

      // Adapta o formato para o EJS esperar os mesmos campos
      colecao = {
        id_col: colecao.id_col,
        nome_colecao: colecao.nome_col,
        nome_usuario: req.session.usuario.nome_usu,
      };
    }

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
    console.error("Erro ao carregar a coleção:", err);
    res.status(500).send("Erro ao carregar a coleção.");
  }
});


// Formulário GET para criar coleção
router.get("/criarColecao", async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }
  res.render("criarColecao", {
    nome_usu: req.session.usuario.nome_usu,
    title: "Criar nova coleção",
    erros: req.session.erro || null,
    sucesso: req.session.sucesso || null,
  });
  delete req.session.erro;
  delete req.session.sucesso;
});

router.get("/adicionarObra/:id_col", async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }

  const id_col = req.params.id_col;
  const id_usu = req.session.usuario.id_usu;
  const nome_usu = req.session.usuario.nome_usu;

  try {
    const resultado = await buscarColecaoPorUsu(id_usu);
    const colecoes = resultado.map(c => ({
      id: c.id_colecao,
      nome: c.nome_colecao,
      foto: c.foto_obra
    }));


    console.log("COLECOES RETORNADAS:", colecoes);  // <-- Adicione isso

    res.render("selecionarColecao", {
      id_col,
      nome_usu,
      id_usu,
      colecoes,
      usuario: req.session.usuario, // <-- Isso também faltava antes!
      title: "Adicionar Obra à Coleção",
      erros: req.session.erro || null,
      sucesso: req.session.sucesso || null,
    });

    delete req.session.erro;
    delete req.session.sucesso;
  } catch (err) {
    console.error("Erro ao carregar coleções:", err);
    res.status(500).send("Erro ao carregar coleções.");
  }
});


router.post("/adicionarObra", async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }
  const { id_col, id_obr } = req.body;
  const id_usu = req.session.usuario.id_usu;
  const nome_usu = req.session.usuario.nome_usu;

  // Verifica se os IDs são válidos
  if (!id_col || isNaN(id_col) || !id_obr || isNaN(id_obr)) {
    req.session.erro = "IDs inválidos.";
    return res.redirect(`/colecao/adicionarObra/${id_col}`);
  }
  try {
    // Adiciona a obra à coleção
    await adicionarObraColecao(id_col, id_obr);
    req.session.sucesso = "Obra adicionada à coleção com sucesso!";
    res.redirect(`/colecao/ver/${id_col}`);
  } catch (err) {
    console.error("Erro ao adicionar obra à coleção:", err);
    req.session.erro = "Erro ao adicionar obra à coleção.";
    res.redirect(`/colecao/adicionarObra/${id_col}`);
  }
});

// Criação da coleção (POST)
router.post("/criarColecao", async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }

  const id_usu = req.session.usuario.id_usu;
  const nome_col = req.body.nome_col;

  if (!nome_col || nome_col.trim().length === 0) {
    req.session.erro = "Nome da coleção não pode ser vazio.";
    return res.redirect("/colecao/criar");
  }

  try {
    const id_col = await criarColecao(id_usu, nome_col.trim());

    res.render("criarColecao", {
      usuario: req.session.usuario,
      id_col,
      title: "Criar nova coleção",
      sucesso: "Coleção criada com sucesso!",
      erros: null
    });
  } catch (err) {
    console.error("Erro ao criar coleção:", err);
    req.session.erro = "Erro ao criar coleção.";
    res.redirect("/colecao/criarColecao");
  }
});

// Atualizar nome da coleção
router.post("/atualizarColecao", async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }

  const { id_col, novo_nome } = req.body;

  if (!novo_nome || novo_nome.trim() === "") {
    req.session.erro = "O nome da coleção não pode ser vazio.";
    return res.redirect(`/colecao/ver/${id_col}`);
  }

  try {
    await atualizarColecao(id_col, novo_nome.trim());
    req.session.sucesso = "Nome da coleção atualizado com sucesso!";
    res.redirect(`/colecao/ver/${id_col}`);
  } catch (err) {
    console.error("Erro ao atualizar nome da coleção:", err);
    req.session.erro = "Erro ao atualizar nome da coleção.";
    res.redirect(`/colecao/ver/${id_col}`);
  }
});

// Excluir coleção
router.post("/excluirColecao", async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }

  const { id_col } = req.body;
  const id_usu = req.session.usuario.id_usu;

  try {
    await excluirColecao(id_col);
    req.session.sucesso = "Coleção excluída com sucesso!";
    res.redirect(`/colecao/verTodas/${id_usu}`);
  } catch (err) {
    console.error("Erro ao excluir coleção:", err);
    req.session.erro = "Erro ao excluir coleção.";
    res.redirect(`/colecao/ver/${id_col}`);
  }
});

// Excluir uma obra da coleção
router.post("/excluirObra", async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }

  const { id_col, id_obr } = req.body;

  try {
    await excluirObraColecao(id_col, id_obr);
    req.session.sucesso = "Obra removida da coleção com sucesso!";
    res.redirect(`/colecao/ver/${id_col}`);
  } catch (err) {
    console.error("Erro ao excluir obra da coleção:", err);
    req.session.erro = "Erro ao excluir obra da coleção.";
    res.redirect(`/colecao/ver/${id_col}`);
  }
});

module.exports = router;
