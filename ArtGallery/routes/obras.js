// routes/obras.js (ou onde preferir agrupar)
const express = require("express");
const router  = express.Router();
const {
  jaFavoritou,       // bool  -> usuário já marcou?
  favoritar,         // void  -> grava favorito
  desfavoritar,      // void  -> remove favorito
  contarFavoritos,   // int   -> total atual
} = require("../banco");

router.get("/", async (req, res) => {
    if (!req.session.usuario) {
        return res.redirect("/login");
    }

    try {
        const usuario = req.session.usuario.id;
        const obras = await contarFavoritos(usuario);
        
        res.render("obras", { obras, usuario });
    } catch (err) {
        console.error("Erro ao carregar obras:", err);
        res.status(500).send("Erro ao carregar obras");
    }
});

router.get("/:id", async (req, res) => {
    if (!req.session.usuario) {
        return res.redirect("/login");
    }
    const obraId = req.params.id.includes('=')
        ? req.params.id.split('=')[1] 
        : req.params.id;
    const usuario = req.session.usuario.id;
    try {
        const obra = await contarFavoritos(obraId);
        if (!obra) {
            return res.status(404).send("Obra não encontrada");
        }
        const jaFavoritouObra = await jaFavoritou(usuario, obraId);
        res.render("obraDetalhes", { obra, jaFavoritou: jaFavoritouObra, usuario });
    } catch (err) {
        console.error("Erro ao carregar detalhes da obra:", err);
        res.status(500).send("Erro ao carregar detalhes da obra");
    }
}
);


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

router.get("/comentar/:id", async (req, res) => {
    if (!req.session.usuario) {
        return res.redirect("/login");
    }

    const obraId = req.params.id.includes('=') 
        ? req.params.id.split('=')[1] 
        : req.params.id;
    const usuario = req.session.usuario.id;

    // --- BLOQUEIO de 5s ---
    const agora = Date.now();
    const ultimoClique = req.session.ultimoCom?.[obraId] || 0;

    if (agora - ultimoClique < 5000) {
        console.log("Clique bloqueado por 5s");
        return res.redirect("back"); // volta para a mesma página
    }

    // Atualiza a marca de tempo
    req.session.ultimoCom = {
        ...(req.session.ultimoCom || {}),
        [obraId]: agora
    };

    try {
        // Aqui você deve implementar a lógica para comentar a obra
        // Exemplo: await comentar(usuario, obraId, req.body.comentario);

        res.redirect("back"); // volta para a página anterior
    } catch (err) {
        console.error("Erro ao comentar:", err);
        res.status(500).send("Erro ao comentar obra");
    }
});

router.get("/colecionar/:id", async (req, res) => {
    if (!req.session.usuario) {
        return res.redirect("/login");
    }

    const obraId = req.params.id.includes('=') 
        ? req.params.id.split('=')[1] 
        : req.params.id;
    const usuario = req.session.usuario.id;

    // --- BLOQUEIO de 5s ---
    const agora = Date.now();
    const ultimoClique = req.session.ultimoCol?.[obraId] || 0;

    if (agora - ultimoClique < 5000) {
        console.log("Clique bloqueado por 5s");
        return res.redirect("back"); // volta para a mesma página
    }

    // Atualiza a marca de tempo
    req.session.ultimoCol = {
        ...(req.session.ultimoCol || {}),
        [obraId]: agora
    };

    try {
        // Aqui você deve implementar a lógica para colecionar a obra
        // Exemplo: await colecionar(usuario, obraId);

        res.redirect("back"); // volta para a página anterior
    } catch (err) {
        console.error("Erro ao colecionar:", err);
        res.status(500).send("Erro ao colecionar obra");
    }
});

module.exports = router;
