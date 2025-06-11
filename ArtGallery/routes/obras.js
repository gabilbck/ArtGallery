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
        usuNome: req.session.usuario.nome_usu,
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
  erros = "clique bloquad por 5s";
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
    res.redirect(`/obras/id=${obraId}`);
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
    res.redirect(`/obras/id=${obraId}`);
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
    } else{
      
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


// router.get("/comentar/:id", async (req, res) => {
//   if (!req.session.usuario) {
//     return res.redirect("/login");
//   }

//   const obraId = req.params.id.includes("=")
//     ? req.params.id.split("=")[1]
//     : req.params.id;
//   const usuario = req.session.usuario.id;

//   // --- BLOQUEIO de 5s ---
//   const agora = Date.now();
//   const ultimoClique = req.session.ultimoCom?.[obraId] || 0;

//   if (agora - ultimoClique < 5000) {
//     console.log("Clique bloqueado por 5s");
//     return res.redirect("back", {usuario: req.session.usuario || null}); // volta para a mesma página
//   }

//   // Atualiza a marca de tempo
//   req.session.ultimoCom = {
//     ...(req.session.ultimoCom || {}),
//     [obraId]: agora,
//   };

//   try {
//     // Aqui você deve implementar a lógica para comentar a obra
//     // Exemplo: await comentar(usuario, obraId, req.body.comentario);

//     res.redirect("back"); // volta para a página anterior
//   } catch (err) {
//     console.error("Erro ao comentar:", err);
//     res.status(500).send("Erro ao comentar obra");
//   }
// });

// router.get("/:id/colecionar", async (req, res) => {
//   if (!req.session.usuario) {
//     return res.redirect("/login");
//   }

//   const obraId = req.params.id.includes("=")
//     ? req.params.id.split("=")[1]
//     : req.params.id;
//   const usuario = req.session.usuario.id;

//   // --- BLOQUEIO de 5s ---
//   const agora = Date.now();
//   const ultimoClique = req.session.ultimoCol?.[obraId] || 0;

//   if (agora - ultimoClique < 5000) {
//     console.log("Clique bloqueado por 5s");
//     return res.redirect("back", {usuario: req.session.usuario || null}); // volta para a mesma página
//   }

//   // Atualiza a marca de tempo
//   req.session.ultimoCol = {
//     ...(req.session.ultimoCol || {}),
//     [obraId]: agora,
//   };

//   try {
//     // Aqui você deve implementar a lógica para colecionar a obra
//     // Exemplo: await colecionar(usuario, obraId);

//     res.redirect("back", {usuario: req.session.usuario || null}); // volta para a página anterior
//   } catch (err) {
//     console.error("Erro ao colecionar:", err);
//     res.status(500).send("Erro ao colecionar obra");
//   }
// });

module.exports = router;