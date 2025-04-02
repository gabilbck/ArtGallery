const express = require("express");
const router = express.Router();

// Rota de registro para usuários artistas
router.get("/cadastroUserArt", (req, res) => {
   res.send("Rota de registro de usuários artistas funcionando!");
});

module.exports = router;
