const express = require("express");
const router = express.Router();
const { logger } = require('../logger'); //->impoirt o logger
const { buscarTodasCategorias, buscarUmaCategoria, buscarObrasPorCategoria9, buscarArtistasPorCategoriaDeObra, buscarObrasPorCategoria } = require("../banco");


router.get("/", async (req, res) => {
   if (!req.session.usuario) {
      logger.warn(`[CATEGORIAS] Tentativa de acesso sem login | IP: ${req.ip}`);
      return res.redirect("/login");
   }
   try {
      logger.info(`[CATEGORIAS] Usuário acessou lista de categorias | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
      const categorias = await buscarTodasCategorias();
      res.render("categorias", {
         title: "Categorias – ArtGallery",
         usuario: req.session.usuario || null,
         itens: categorias.map((c) => ({
            id: c.id,
            nome: c.nome,
            foto: c.foto,
            tabela: "categoria",
         })),
      });
   } catch (err) {
      logger.error(`[CATEGORIAS] Erro ao buscar categorias | UsuarioID: ${req.session.usuario?.id_usu} | IP: ${req.ip} | Erro: ${err.message}`);
      res.status(500).send("Erro ao carregar categorias");
   }
});

// Rota para exibir obras de uma categoria específica   UE CArrega NA PÁGINA categoriasID.ejs
router.get("/:id", async (req, res) => {
  if (!req.session.usuario) {
    logger.warn(`[CATEGORIAS] Tentativa de acesso à categoria sem login | IP: ${req.ip}`);
    return res.redirect("/login");
  } else {
    const id = req.params.id.includes('=') 
      ? req.params.id.split('=')[1] 
      : req.params.id;
    
    logger.info(`[CATEGORIAS] Usuário acessou categoria | CategoriaID: ${id} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
    try {
      const categoria = await buscarUmaCategoria(id);
      if (!categoria) {
        logger.warn(`[CATEGORIAS] Categoria não encontrada | CategoriaID: ${id} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
        return res.status(404).send("Categoria não encontrada");
      }
      const obras9 = await buscarObrasPorCategoria9(id);
      const artistas3 = await buscarArtistasPorCategoriaDeObra(id);
      const obras = await buscarObrasPorCategoria(id);
      logger.info(`[CATEGORIAS] Dados carregados para categoria | CategoriaID: ${id} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip}`);
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
        })),
        artistas3: artistas3.map(a => ({
          id: a.id,
          idUsu: a.idUsu,
          nome: a.nome,
          nomec: a.nomec,
          foto: a.foto,
          tabela: "artista"
        })), 
        obras: obras.map(o => ({
          id: o.id,
          nome: o.nome,
          art: o.art,
          foto: o.foto,
          tabela: "obra"
        }))
      });
    } catch (err) {
      logger.error(`[CATEGORIAS] Erro ao buscar categoria ou obras | CategoriaID: ${id} | UsuarioID: ${req.session.usuario.id_usu} | IP: ${req.ip} | Erro: ${err.message}`);
      res.status(500).send("Erro ao carregar categoria ou obras");
    }
  }
});

module.exports = router;
