// routes/explorar.js
const express = require('express');
const router = express.Router();
const {
  // importe aqui outras funções futuras...
} = require("../banco");

router.get("/", async function(req, res, next){
    if (!req.session.usuario) {
        return res.redirect("/login");
    }
});

module.exports = router;