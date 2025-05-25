// routes/obras.js (ou onde preferir agrupar)
const express = require("express");
const router  = express.Router();
const {
  jaFavoritou,       // bool  -> usuário já marcou?
  favoritar,         // void  -> grava favorito
  desfavoritar,      // void  -> remove favorito
  contarFavoritos,   // int   -> total atual
} = require("../banco");

// routes/obras.js ou semelhante
router.get("/favoritar/:id", async (req, res) => {
    if (!req.session.usuario) {
        return res.redirect("/login");
    }

    const obraId = req.params.id.includes('=') 
        ? req.params.id.split('=')[1] 
        : req.params.id;
    const usuario = req.session.usuario.id;

    // --- BLOQUEIO de 5s ---
    const agora = Date.now();
    const ultimoClique = req.session.ultimoFav?.[obraId] || 0;

    if (agora - ultimoClique < 5000) {
        console.log("Clique bloqueado por 5s");
        return res.redirect("back"); // volta para a mesma página
    }

    // Atualiza a marca de tempo
    req.session.ultimoFav = {
        ...(req.session.ultimoFav || {}),
        [obraId]: agora
    };

    try {
        // Alterna favorito ↔ desfavorito
        if (await jaFavoritou(usuario, obraId)) {
            await desfavoritar(usuario, obraId);
        } else {
            await favoritar(usuario, obraId);
        }

        res.redirect("back"); // volta para a página anterior
    } catch (err) {
        console.error("Erro ao favoritar:", err);
        res.status(500).send("Erro ao favoritar obra");
    }
});

module.exports = router;
