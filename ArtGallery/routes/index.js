const express = require("express");
const router = express.Router();

// Rota para redirecionamento com ID
router.get("/", function (req, res, next) {
   if (global.userComEmail && global.userComEmail != "") {
      res.redirect("/loginUserCom");
   } else if (global.userArtEmail && global.userArtEmail != "") {
      res.redirect("/loginUserArt");
   } else {
      res.redirect("/index");
   }
});

// Rota para usuários comuns
router.get("/userCom", (req, res) => {
   res.send("Página do Usuário Comum");
});

// Rota para usuários artistas
router.get("/userArt", (req, res) => {
   res.send("Página do Usuário Artista");
});

module.exports = router;
