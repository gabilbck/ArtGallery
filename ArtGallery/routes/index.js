const express = require("express");
const router = express.Router();
const { buscarUsuario } = require("../banco"); // Importa a função de busca de usuário

// Rota inicial
router.get("/", (req, res) => {
   if (global.userComEmail) {
      return res.redirect("/loginUserCom");
   } else if (global.userArtEmail) {
      return res.redirect("/loginUserArt");
   } else {
      return res.redirect("/index");
   }
});

// Página de login
router.get("/index", (req, res) => {
   res.render("index", { title: "Login - ArtGallery", erros: {}, sucesso: null });
});

// Processar login com banco de dados
router.post("/index", async (req, res) => {
   const { email, senha } = req.body;
   let erros = {};

   if (!email) erros.email = "E-mail obrigatório.";
   if (!senha) erros.senha = "Senha obrigatória.";

   if (Object.keys(erros).length > 0) {
      return res.render("index", { title: "Login - ArtGallery", erros, sucesso: null });
   }

   try {
      const usuario = await buscarUsuario({ email, senha });

      if (usuario.id_usu) { 
         req.session.usuario = usuario; // Armazena o usuário na sessão
         return res.render("index", { title: "Login - ArtGallery", erros: {}, sucesso: "Login realizado com sucesso!" });
      } else {
         return res.render("index", { title: "Login - ArtGallery", erros: { email: "E-mail ou senha incorretos." }, sucesso: null });
      }
   } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return res.render("index", { title: "Login - ArtGallery", erros: { email: "Erro no servidor, tente novamente." }, sucesso: null });
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