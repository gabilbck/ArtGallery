// routes/obras.js (ou onde preferir agrupar)
const express = require("express");
const router = express.Router();
const {
  jaFavoritou, // bool  -> usuário já marcou?
  favoritarObra, // void  -> grava favorito
  desfavoritarObra, // void  -> remove favorito
  contarFavoritos, // int   -> total atual
  buscarUmaObra,
  buscarComentariosPorObra,
  comentarObra,
  excluirComentario
} = require("../banco");

// router.get("/", async (req, res) => {
//   if (!req.session.usuario) {
//     return res.redirect("/login");
//   }

//   try {
//     const usuario = req.session.usuario.id;
//     const obras = await contarFavoritos(usuario);

//     res.render("obras", { obras, usuario });
//   } catch (err) {
//     console.error("Erro ao carregar obras:", err);
//     res.status(500).send("Erro ao carregar obras");
//   }
// });

router.get("/:id", async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }
  const obraId = req.params.id.includes("=")
    ? req.params.id.split("=")[1]
    : req.params.id;
  const usuario = req.session.usuario.id_usu;
  try {
    const obra = await buscarUmaObra(obraId);
    const jaFavoritouObra = await jaFavoritou(usuario, obraId);
    const comentarios = await buscarComentariosPorObra(obraId); // Supondo que você tenha uma função para buscar comentários

    if (!obra) {
      return res.status(404).send("Obra não encontrada");
    }

    const erros = req.session.erro || null;
    const sucesso = req.session.sucesso || null;
    delete req.session.erro;
    delete req.session.sucesso;

    res.render("ObraID", { 
        obra: {
            id: obra.id, 
            titulo: obra.titulo,
            id_art: obra.id_art, 
            id_usu_art: obra.id_usu_art,
            artU: obra.artU,
            artC: obra.artC,
            foto: obra.foto, 
            des: obra.des, 
            qcom: obra.qcom,
            qfav: obra.qfav,
            tabela: "obra"
        },
        title: `Obra: ${obra.titulo} – ArtGallery`,
        jaFavoritou: jaFavoritouObra, 
        comentarios: comentarios.map(c => ({
            id_com: c.id_com,
            id_usu: c.id_usu,
            id_obr: c.id_obr,
            nome: c.nome,
            usu: c.usu,
            foto: c.foto,
            texto: c.texto,
            tabela: "comentario"
        })),
        usuario: req.session.usuario, 
        erros,
        sucesso
    });
  } catch (err) {
    console.error("Erro ao carregar detalhes da obra:", err);
    res.status(500).send("Erro ao carregar detalhes da obra");
  }
});

router.get("/:id/favoritar", async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }
  const usuId = req.session.usuario.id_usu;
  const obraId = req.params.id.includes("=")
    ? req.params.id.split("=")[1]
    : req.params.id;

  // --- BLOQUEIO de 5s ---
  const agora = Date.now();
  const ultimoClique = req.session.ultimoFav?.[obraId] || 0;

  if (agora - ultimoClique < 5000) {
  console.log("Clique bloqueado por 5s");
  req.session.erro = "Espere pelo menos 5 segundos antes de favoritar novamente.";
  return res.redirect(`/obras/${obraId}`); 
}


  // Atualiza a marca de tempo
  req.session.ultimoFav = {
    ...(req.session.ultimoFav || {}),
    [obraId]: agora,
  };

  try {
    // Alterna favorito ↔ desfavorito
    console.log("usuId:", usuId, "obraId:", obraId);
    if (await jaFavoritou(usuId, obraId)) {
      await desfavoritarObra(usuId, obraId);
    } else {
      await favoritarObra(usuId, obraId);
    }
    console.log("Favoritou");
    res.redirect(`/obras/${obraId}`);
  } catch (err) {
    console.error("Erro ao favoritar:", err);
    res.status(500).send("Erro ao favoritar obra");
  }
});

router.post("/:id/favoritar", async (req, res) => {
  if (!req.session.usuario) {
    return res.status(401).json({ sucesso: false, mensagem: "Não autenticado" });
  }

  const id_usu = req.session.usuario.id_usu;
  const id_obr = req.params.id;

  try {
    const jaTem = await jaFavoritou(id_usu, id_obr);
    if (jaTem) {
      await desfavoritarObra(id_usu, id_obr);
    } else {
      await favoritarObra(id_usu, id_obr);
    }

    const total = await contarFavoritos(id_obr);

    return res.json({
      sucesso: true,
      favoritado: !jaTem,
      total,
    });
  } catch (err) {
    console.error("Erro ao favoritar via AJAX:", err);
    return res.status(500).json({ sucesso: false, mensagem: "Erro interno" });
  }
});

router.get("/:id/comentar", async (res, req) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }
  const usuId = req.session.usuario.id_usu;
  const obraId = req.params.id.includes("=")
    ? req.params.id.split("=")[1]
    : req.params.id;
  const comentario = req.params.comentario;
  // --- BLOQUEIO de 5s ---
  const agora = Date.now();
  const ultimoClique = req.session.ultimoFav?.[obraId] || 0;

  if (agora - ultimoClique < 5000) {
    console.log("Clique bloqueado por 5s");
    res.redirect(`/obras/${obraId}`);
  }

  // Atualiza a marca de tempo
  req.session.ultimoFav = {
    ...(req.session.ultimoFav || {}),
    [obraId]: agora,
  };

  try {
    if (!!comentario){
    await comentarObra(usuId, obraId, comentario);
    console.log(`$usuID: $comentario (na obra $obraId)`);
    res.redirect(`/obras/${obraId}`);
    } 
  } catch (err) {
    console.error("Erro ao comentar:", err);
    res.status(500).send("Erro ao comentar na obra");
  }
});

// Corrija seu método de POST para comentar:
router.post("/:id/comentar", async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/login");
  }

  const id_usu = req.session.usuario.id_usu;
  const id_obr = req.params.id;
  const comentario = req.body.comentario;

  if (!comentario || comentario.length > 255) {
    req.session.erro = "Comentário inválido: precisa ter entre 1 e 255 caracteres.";
    return res.redirect(`/obras/${id_obr}`);
  }

  try {
    await comentarObra(id_usu, id_obr, comentario);
    req.session.sucessoComentario = "Comentário enviado com sucesso!";
    res.redirect(`/obras/${id_obr}`);
  } catch (err) {
    console.error("Erro ao comentar:", err);
    req.session.erro = "Erro ao enviar comentário.";
    res.redirect(`/obras/${id_obr}`);
  }
});

router.post("/:id/comentarios/:id_com/excluir", async (req, res) => {
  if (!req.session.usuario) return res.redirect("/login");

  const id_com = req.params.id_com;
  const id_obr = req.params.id;
  const usuarioLogado = req.session.usuario;

  try {
    const comentarios = await buscarComentariosPorObra(id_obr);
    const comentario = comentarios.find(c => c.id_com == id_com);

    if (!comentario) {
      req.session.erro = "Comentário não encontrado.";
      return res.redirect(`/obras/${id_obr}`);
    }

    // Apenas dono do comentário ou artista da obra pode excluir
    const obra = await buscarUmaObra(id_obr);
    if (
      usuarioLogado.id_usu !== comentario.id_usu &&
      usuarioLogado.id_usu !== obra.id_art
    ) {
      req.session.erro = "Você não tem permissão para excluir esse comentário.";
      return res.redirect(`/obras/${id_obr}`);
    }

    await excluirComentario(id_com);
    req.session.sucesso = "Comentário excluído com sucesso.";
    res.redirect(`/obras/${id_obr}`);
  } catch (err) {
    console.error("Erro ao excluir comentário:", err);
    req.session.erro = "Erro ao tentar excluir o comentário.";
    res.redirect(`/obras/${id_obr}`);
  }
});


module.exports = router;