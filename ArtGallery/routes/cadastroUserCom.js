const express = require("express");
const router = express.Router();

// Rota de registro para usuários comuns
router.get("/cadastroUserCom", (req, res) => {
   res.send("Rota de registro de usuários comuns funcionando!");
});

module.exports = router;
