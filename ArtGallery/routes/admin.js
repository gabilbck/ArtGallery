const express = require("express");
const router = express.Router();

// Rota de administração
router.get("/admin", (req, res) => {
   res.send("Rota de admin funcionando!");
});

module.exports = router;
