const express = require("express");
const router = express.Router();

// Rota principal: exibe a página index, independentemente do usuário estar logado ou não
router.get("/", (req, res) => {
    res.render("index", {
        title: "Página Inicial - ArtGallery",
        usuario: req.session.usuario || null
    });
});

// Rota de logout: somente disponível para usuário logado
router.get("/logout", (req, res) => {
    if (req.session.usuario) {
        req.session.destroy(() => {
            res.redirect("/");
        });
    } else {
        res.redirect("/");
    }
});

module.exports = router;