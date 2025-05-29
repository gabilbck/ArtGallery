const express = require("express");
const router = express.Router();

// Rota de administração
router.get("/admin", (req, res) => {
   res.send("Rota de admin funcionando!", {
      usuario: req.session.usuario || null  
   }
   );
});

module.exports = router;
