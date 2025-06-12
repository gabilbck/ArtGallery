const express = require("express");
const router = express.Router();
const { 
    buscarColecaoPorUsu,
    criarColecao,
    excluirColecao
} = require("../banco");

router.get("/", async (res, req) => {
    if (!req.session.usuario) {
        return res.redirect("/login");
    }
    const id_usu = req.session.usuario.id_usu;
    res.redirect(`/colecao/${id_usu}`);
});

router.get("/:id_usu", async (res, req) => {
    if (!req.session.usuario) {
        return res.redirect("/login");
    }
    const id_usu = req.session.usuario.id_usu;
    const nome_usu = req.session.usuario.nome_usu;
    const colecoes = await buscarColecaoPorUsu(id_usu);

    const erros = req.session.erro || null;
    const sucesso = req.session.sucesso || null;
    delete req.session.erro;
    delete req.session.sucesso;

    if (!colecoes){
        return res.redirect("/colecao/criar");
    } else {
        try{
        res.render("colecoes", {
            colecoes: {
                id_col: c.idCol,
                nome_col: c.nome,
                foto_col: c.foto
            },
            id_usu,
            title: `Coleções de ${nome_usu}`
        })} 
        catch (err) {
            console.log("Erro ao buscar coleções: " + err),
            res.status(500).send("Erro ao buscar coleções");
        }
    }
})

router.get("/criar", async (res, req) => {
    if (!req.session.usuario) {
        return res.redirect("/login");
    }
    const id_usu = req.session.usuario.id_usu;
    const nome_usu = req.session.usuario.nome_usu;
    const colecoes = await buscarColecaoPorUsu(id_usu);

    //carregar a pagina para criação de coleções
})


//router para processar a exclusão (somente post, não carrega uma página especifica, apenas recarrega  amesma pagina com todas as coleões)

//post para criação da categoria

//post para update da categoria

module.exports = router;