const express = require("express");
const router = express.Router();
const {
  buscarColecaoes,
  buscarObrasPorColecao,
  criarColecao,
  excluirColecao,
  atualizarColecao,
  adicionarObraColecao,
  excluirObraColecao,
} = require("../banco");

// Página principal redireciona para as coleções do usuário logado
router.get("/", async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }
  const id_usu = req.session.usuario.id_usu;
  res.redirect(`/colecao/verTodas/${id_usu}`);
});

// Página que exibe as coleções do usuário, permite excluir coleção e clicar na página da coleção
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
      colecoes,
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

router.get("/ver/:id", (req, res) => {
    // visualiza mas também dá a visualização do botão de alterar nome, escluir obra e excluir coleção, além de clicar na obra pra ser redirecionado
    // se o usuário da coleção não for o mesmo logado, não deve aparecer os botoões pra alterações, somente o titulo  e imagem das obras da coleção
});

// Rota GET → mostra o formulário de criação de coleção
router.get("/criarColecao", (req, res) => {
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

// Rota POST → recebe os dados do formulário e cria a coleção e manda pra /ver/:id
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
    await criarColecao(id_usu, nome_col.trim());
    res.render("criarColecao", {
      nome_usu: req.session.usuario.nome_usu,
      title: "Criar nova coleção",
      sucesso: "Coleção criada com sucesso!",
      erros: null,
    });
  } catch (err) {
    console.error("Erro ao criar coleção:", err);
    req.session.erro = "Erro ao criar coleção.";
    res.redirect("/colecao/criar");
  }
});

router.post("/atualizarColecao", async (req, res) => {
  // Só vai atualizar o nome da coleção e voltar para página da coleção
});

router.post("/excluirColecao", async (req, res) => {
 // esclui a coleção e manda pra verTodas/:id_usu
});

router.post("/adicionarObra", async (req, res) => {
    // Adiciona a obra a coleção e manda pra página da coleção corresponente à adição
});

router.post("/excluirObra", async (req, res) => {
    // Só vai excluir a obra da coleção e volta pra pagina da coleção
});

module.exports = router;
