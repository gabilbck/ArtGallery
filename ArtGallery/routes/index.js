const express = require("express");
const router = express.Router();
const { buscarUsuario } = require("../banco"); // Importa a função de busca de usuário

// Rota inicial
router.get("/", (req, res) => {
   return res.redirect("/index");
});

// Página de login
router.get("/index", (req, res) => {
   res.render("index", { title: "Login - ArtGallery", erros: null, sucesso: null });
});

// Processar login com banco de dados
router.post("/index", async (req, res) => {
   const { email, senha } = req.body;
   let erros = null;

   if ((!email) || (!senha)) {
      erros = "E-mail e senha são obrigatórios!";
   }

   if (erros) {
      return res.render("index", { title: "Login - ArtGallery", erros, sucesso: null });
   }

   try {
      const usuario = await buscarUsuario({ email, senha });

      if (usuario.id_usu) { 
         req.session.usuario = usuario; // Armazena o usuário na sessão
         return res.render("index", { title: "Login - ArtGallery", erros: null, sucesso: true });
      } else {
         return res.render("index", { title: "Login - ArtGallery", erros: "E-mail ou senha incorretos.", sucesso: null });
      }
   } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return res.render("index", { title: "Login - ArtGallery", erros: "Erro no servidor, tente novamente.", sucesso: null });
   }
});

router.get('/sucesso', (req, res) => {
   console.log("Usuário na sessão:", req.session.usuario); // Verifica se a sessão contém os dados

   if (!req.session.usuario) {
      return res.redirect('/'); // Redireciona se a sessão estiver vazia
   }
   
   res.render('sucesso');
});
 
module.exports = router;