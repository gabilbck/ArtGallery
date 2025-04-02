const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
   res.send("Rota de usuários artista funcionando!");
});

router.get("/userArt", (req, res) => {
   if (global.userArtEmail && global.userArtEmail !== "") {
      return res.redirect("/userArt");
   }
   res.render("userArt", {
      title: "Página de Cadastro dos Usuários Artuns",
   });
});

router.post("/loginUserArt", async (req, res) => {
   const { email, senha } = req.body;

   try {
      const usuario = await global.banco.buscarUserArt({ email, senha });
      if (usuario && usuario.userArtCodigo) {
         global.userArtCodigo = usuario.userArtCodigo;
         global.userArtEmail = usuario.userArtEmail;
         return res.redirect("/userArt");
      }
   } catch (error) {
      console.error("Erro no login:", error);
   }
   res.redirect("/");
});

router.get("/userArt/:id", async (req, res) => {
   const codigoUserArt = parseInt(req.params.id);

   try {
      const dadosPerfilUserArt = await global.banco.buscarPerfilUserArt(
         codigoUserArt
      );
      if (dadosPerfilUserArt) {
         global.perfil = dadosPerfilUserArt;
         await global.banco.registrarLoginPerfil(codigoUserArt);
      }
   } catch (error) {
      console.error("Erro ao registrar login:", error);
   }

   res.redirect("/index");
});

module.exports = router;
