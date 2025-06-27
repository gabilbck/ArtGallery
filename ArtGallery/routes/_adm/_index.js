// routes/index.js
const express = require("express");
const router = express.Router();
const {

} = require("../../banco");

router.get("/", (req, res) => {
    if (!req.session.usuario) return res.redirect("/login")
    const tipo_usu = req.session.usuario.tipo_usu;
    if (tipo_usu !== "adm") return res.redirect("/");
    res.render("_adm/_index", {
        usuario: req.session.usuario,
        title: "Administração - ArtGallery"
    });
});

module.exports = router;