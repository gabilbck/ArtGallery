const express = require("express");
const router = express.Router();
const { buscarTodasCategorias, buscarUmaCategoria, buscarObrasPorCategoria9 } = require("../banco");


router.get("/", async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }
  try {
    const categorias = await buscarTodasCategorias();
    res.render("categorias", {
      title: "Categorias – ArtGallery",
      usuario: req.session.usuario || null,
      itens: categorias.map(c => ({ id: c.id, nome: c.nome, foto: c.foto, tabela: "categoria" })),
    });
  } catch (err) {
    console.error("Erro ao buscar categorias:", err);
    res.status(500).send("Erro ao carregar categorias");
  }
});

// Rota para exibir obras de uma categoria específica   UE CArrega NA PÁGINA categoriasID.ejs
router.get("/:id", async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }
  else {
    const id = req.params.id.includes('=') 
      ? req.params.id.split('=')[1] 
      : req.params.id;
    
    try {
      const categoria = await buscarUmaCategoria(id);
      if (!categoria) {
        return res.status(404).send("Categoria não encontrada");
      }
      const obras9 = await buscarObrasPorCategoria9(id);
      res.render("categoriasID", {
        title: `Categoria: ${categoria.nome} – ArtGallery`,
        usuario: req.session.usuario,
        categoria: { 
          id: categoria.id, 
          nome: categoria.nome, 
          desc: categoria.desc, 
          foto: categoria.foto 
        },
        obras9: obras9.map(o => ({
          id: o.id,
          nome: o.nome,
          art: o.art,
          foto: o.foto,
          tabela: "obra"
        }))
      });
    } catch (err) {
      console.error("Erro ao buscar categoria ou obras:", err);
      res.status(500).send("Erro ao carregar categoria ou obras");
    }
  }
});


module.exports = router;