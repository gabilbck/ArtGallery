const mysql = require("mysql2/promise");

async function conectarBD() {
  if (global.conexao && global.conexao.state !== "DESCONECTADO") {
    return global.conexao;
  }

  const conexao = await mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "artg",
  });

  console.log("Conectou ao MySQL!");
  global.conexao = conexao;
  return conexao;
}

// Usuários
async function buscarUsuario(usuario) {
  const conexao = await conectarBD();
  const sql = `SELECT id_usu, nome_usu, email_usu, tipo_usu, foto_usu 
    FROM usuario 
    WHERE email_usu = ? AND senha_usu = ?`;
  const [linhas] = await conexao.query(sql, [usuario.email, usuario.senha]);
  return linhas.length > 0 ? linhas[0] : null;
}
async function registrarUsuario(dadosUsuario) {
  const { email, nome, usuario, senha, tipo_usu } = dadosUsuario;
  const conexao = await conectarBD();
  const sql =
    "INSERT INTO usuario (email_usu, nome_comp, nome_usu, senha_usu, tipo_usu) VALUES (?, ?, ?, ?, ?)";
  try {
    const [resultado] = await conexao.execute(sql, [
      email,
      nome,
      usuario,
      senha,
      tipo_usu,
    ]);
    console.log("Usuario cadastrado com sucesso: ", resultado);
    return resultado;
  } catch (erro) {
    console.error("Erro ao cadastrar usuario:", erro); // <-- corrigido
    throw erro;
  }
}
async function buscarDadosUsuario(usuario) {
  //para exibir no perfil
  const conexao = await conectarBD();

  const sql = `
   SELECT
      id_usu, email_usu, senha_usu
      FROM usuario
      WHERE email_usu = ? AND senha_usu = ?;
   `;
  const [linhas] = await conexao.query(sql, [usuario.email, usuario.senha]);
  return linhas.length > 0 ? linhas[0] : null;
}

async function buscarDadosUsuarioPorId(id_usu) {
  // para exibir no perfil os dados atualizados
  const conexao = await conectarBD(); // sua função para conectar ao DB
  const sql = `
    SELECT 
      id_usu, nome_usu, nome_comp, email_usu, foto_usu, bio_usu, tipo_usu, advertencia_usu, ban_usu
    FROM usuario
    WHERE id_usu = ?;
  `;
  const [linhas] = await conexao.query(sql, [id_usu]);
  return linhas[0]; // retorna o primeiro resultado (ou undefined se não achar)
}

// Artistas
async function buscarArtista(id_art) {
  const conexao = await conectarBD();
  const sql = `SELECT id_art AS id, nome_usu AS nome, foto_art AS foto FROM artista WHERE id_art = ?`;
  const [linhas] = await conexao.query(sql, [id_art]);
  return linhas.length > 0 ? linhas[0] : null;
}
async function buscarArtistasPorCategoriaDeObra(id_cat) {
  const conexao = await conectarBD();
  const sql = `
    SELECT DISTINCT a.id_art AS id, a.nome_usu AS nome, a.nome_comp AS nomec, a.foto_art AS foto
    FROM artista a
    INNER JOIN obra o ON a.id_art = o.id_art
    WHERE o.id_cat = ? AND o.situacao_obr = 1
    LiMIT 3;
`;
  const [linhas] = await conexao.query(sql, [id_cat]);
  return linhas;
}

// Categorias
async function buscarTodasCategorias() {
  const conexao = await conectarBD();
  const sql = `SELECT id_cat AS id, nome_cat AS nome, descricao_cat AS descricao, foto_cat AS foto FROM categoria`;
  const [linhas] = await conexao.query(sql);
  return linhas;
}
async function buscarUmaCategoria(id) {
  const conexao = await conectarBD();
  const sql = `SELECT id_cat AS id, nome_cat AS nome, descricao_cat AS \`desc\`, foto_cat AS foto FROM categoria WHERE id_cat = ?`;
  const [linhas] = await conexao.query(sql, [id]);
  return linhas.length > 0 ? linhas[0] : null;
}
async function buscarInicioCategorias() {
  const conexao = await conectarBD();
  const sql = `SELECT id_cat AS id, nome_cat AS nome, foto_cat AS foto FROM categoria ORDER BY RAND() LIMIT 6`;
  const [linhas] = await conexao.query(sql);
  return linhas;
}

// Obras
async function buscarTodasObras() {
  const conexao = await conectarBD();
  const sql = `SELECT id_obr AS id, titulo_obr AS nome FROM obra`;
  const [linhas] = await conexao.query(sql);
  return linhas;
}
async function buscarUmaObra(id_obr) {
  const conexao = await conectarBD();
  const sql = `
            SELECT 
                o.id_obr AS id,
                o.titulo_obr AS titulo,
                a.id_art AS id_art,
                a.id_usu as id_usu_art,
                a.nome_usu AS artU,
                a.nome_comp AS artC,
                COALESCE(o.foto_obr, '/uploads/imagem.png') AS foto,
                o.descricao_obr AS des,
                (
                    SELECT COUNT(*) 
                    FROM comentario c 
                    WHERE c.id_obr = o.id_obr
                ) AS qcom,
                (
                    SELECT COUNT(*) 
                    FROM favorito_obra f 
                    WHERE f.id_obr = o.id_obr AND f.ativo = 1
                ) AS qfav
            FROM obra o
            INNER JOIN artista a ON o.id_art = a.id_art
            WHERE o.id_obr = ? AND o.situacao_obr = 1
            LIMIT 1
        `;
  const [linhas] = await conexao.query(sql, [id_obr]);
  return linhas.length > 0 ? linhas[0] : null;
}
async function buscarUmaObraDetalhada(id_obr, id_usu = 0) {
  const conexao = await conectarBD();
  const sql = `
            SELECT 
                o.id_obr AS id,
                o.titulo_obr AS nome,
                a.nome_usu AS art,
                COALESCE(o.foto_obr, '/uploads/imagem.png') AS foto,
                o.descricao_obr AS des,
                (
                    SELECT COUNT(*) 
                    FROM comentario c 
                    WHERE c.id_obr = o.id_obr
                ) AS qcom,
                (
                    SELECT COUNT(*) 
                    FROM favorito_obra f 
                    WHERE f.id_obr = o.id_obr AND f.ativo = 1
                ) AS qfav,
                (
                    SELECT COUNT(*)
                    FROM favorito_obra f
                    WHERE f.id_obr = o.id_obr AND f.id_usu = ? AND f.ativo = 1
                ) > 0 AS favoritou
            FROM obra o
            INNER JOIN artista a ON o.id_art = a.id_art
            WHERE o.id_obr = ? AND o.situacao_obr = 1
            LIMIT 1
        `;
  const [linhas] = await conexao.query(sql, [id_usu, id_obr]);
  return linhas.length > 0 ? linhas[0] : null;
}
async function buscarObrasPorCategoria(id) {
  const conexao = await conectarBD();
  const sql = `SELECT id_obr AS id, titulo_obr AS nome, foto_obr AS foto FROM obra WHERE id_cat = ?`;
  const [linhas] = await conexao.query(sql, [id]);
  return linhas;
}
async function buscarObrasPorCategoria9(id) {
  const conexao = await conectarBD();
  const sql = `
            SELECT 
                o.id_obr AS id,
                o.titulo_obr AS nome,
                a.nome_usu AS art,
                COALESCE(o.foto_obr, '/uploads/imagem.png') AS foto
            FROM obra o
            INNER JOIN artista a ON o.id_art = a.id_art
            WHERE o.id_cat = ? AND o.situacao_obr = 1
            ORDER BY RAND()
            LIMIT 9
        `;
  const [linhas] = await conexao.query(sql, [id]);
  return linhas;
}
async function buscarInicioObras(id) {
  const conexao = await conectarBD();
  const sql = `
        SELECT 
        o.id_obr AS id,
        o.titulo_obr AS nome,
        a.id_art AS id_art,
        a.id_usu AS idUsuArt,
        a.nome_usu AS art,
        o.foto_obr AS foto,
        (
            SELECT COUNT(*) 
            FROM comentario c 
            WHERE c.id_obr = o.id_obr
        ) AS qcom,
        (
            SELECT COUNT(*) 
            FROM favorito_obra f 
            WHERE f.id_obr = o.id_obr AND f.ativo = 1
        ) AS qfav,
        o.descricao_obr AS des
        FROM obra o
        INNER JOIN artista a ON o.id_art = a.id_art
        WHERE o.situacao_obr = 1
        ORDER BY RAND()
        LIMIT 3`;
  const [linhas] = await conexao.query(sql, [id]);
  return linhas;
}
async function buscarObraAletoria() {
  const conexao = await conectarBD();
  const sql = `
            SELECT 
                o.id_obr AS id,
                o.titulo_obr AS nome,
                a.nome_comp AS art,
                a.id_usu AS id_usu_art,
                COALESCE(o.foto_obr, '/uploads/imagem.png') AS foto
            FROM obra o
            INNER JOIN artista a ON o.id_art = a.id_art
            WHERE o.situacao_obr = 1
            ORDER BY RAND()
            LIMIT 1
        `;
  const [linhas] = await conexao.query(sql);
  return linhas.length > 0 ? linhas[0] : null;
}
async function buscarObraMaisComentada() {
  const conexao = await conectarBD();
  const sql = `
            SELECT 
                o.id_obr AS id,
                o.titulo_obr AS nome,
                a.nome_comp AS art,
                COALESCE(o.foto_obr, '/uploads/imagem.png') AS foto,
                COUNT(c.id_com) AS qcom
            FROM obra o
            INNER JOIN artista a ON o.id_art = a.id_art
            LEFT JOIN comentario c ON o.id_obr = c.id_obr
            WHERE o.situacao_obr = 1
            GROUP BY o.id_obr
            ORDER BY qcom DESC
            LIMIT 1
        `;
  const [linhas] = await conexao.query(sql);
  return linhas.length > 0 ? linhas[0] : null;
}
async function buscarObraMaisFavoritada() {
  const conexao = await conectarBD();
  // precisa levar em consideração que a chavbe primaria de favorito_obra é composta por id_usu e id_obr, então precisamos contar os favoritos de cada obra
  const sql = `
    SELECT
        o.id_obr AS id,
        o.titulo_obr AS nome,
        a.nome_comp AS art,
        COALESCE(o.foto_obr, '/uploads/imagem.png') AS foto,
        COUNT(f.id_usu) AS qfav
    FROM obra o
    INNER JOIN artista a ON o.id_art = a.id_art
    LEFT JOIN favorito_obra f ON o.id_obr = f.id_obr AND f.ativo = 1
    WHERE o.situacao_obr = 1
    GROUP BY o.id_obr
    ORDER BY qfav DESC
    LIMIT 1
  `;
  const [linhas] = await conexao.query(sql);
  return linhas.length > 0 ? linhas[0] : null;
}
async function buscarObraMaisFavoritadaDoArtistaMaisSeguido() {
  const conexao = await conectarBD();

  // 1. Busca o artista com mais seguidores
  const [artistaMaisSeguido] = await conexao.query(`
      SELECT a.id_art
      FROM artista a
      LEFT JOIN seguidor_artista sa ON a.id_art = sa.id_artista
      GROUP BY a.id_art
      ORDER BY COUNT(sa.id_seguidor) DESC
      LIMIT 1
  `);

  if (!artistaMaisSeguido.length) return null;

  const idArtista = artistaMaisSeguido[0].id_art;

  // 2. Busca a obra mais favoritada desse artista
  const [obras] = await conexao.query(
    `
      SELECT 
          o.id_obr AS id,
          o.titulo_obr AS nome,
          a.nome_comp AS art,
          COALESCE(o.foto_obr, '/uploads/imagem.png') AS foto,
          COUNT(f.id_usu) AS qfav
      FROM obra o
      INNER JOIN artista a ON o.id_art = a.id_art
      LEFT JOIN favorito_obra f ON o.id_obr = f.id_obr AND f.ativo = 1
      WHERE o.situacao_obr = 1 AND o.id_art = ?
      GROUP BY o.id_obr
      ORDER BY qfav DESC
      LIMIT 1
  `,
    [idArtista]
  );

  return obras.length > 0 ? obras[0] : null;
}

// Coleções
async function buscarColecoesPorUsuario(id_usu) {
  //busca coleções do usuário
  const conexao = await conectarBD();
  const sql = `
    SELECT
      nome_col AS nome_colecao, id_col, titulo_obr AS titulo_obra, descricao_obr
    FROM colecoes_usuario
    WHERE id_usu = ?
    ORDER BY nome_col, titulo_obra;
  `;
  const [linhas] = await conexao.query(sql, [id_usu]);
  return linhas;
}

// Favoritos
async function contarFavoritos(idObra) {
  const conexao = await conectarBD();
  const sql = `SELECT COUNT(*) AS total FROM favorito_obra WHERE id_obr = ? AND ativo = 1`;
  const [linhas] = await conexao.query(sql, [idObra]);
  return linhas[0].total;
}
async function jaFavoritou(id_usu, id_obr) {
  const conexao = await conectarBD();
  const sql = `SELECT COUNT(*) AS total FROM favorito_obra WHERE id_usu = ? AND id_obr = ? AND ativo = 1`;
  const [linhas] = await conexao.query(sql, [id_usu, id_obr]);
  return linhas[0].total > 0;
}
async function favoritarObra(id_usu, id_obr) {
  const conexao = await conectarBD();
  const [result] = await conexao.query(
    `SELECT * FROM favorito_obra WHERE id_usu = ? AND id_obr = ?`,
    [id_usu, id_obr]
  );
  if (result.length > 0) {
    // já existe → atualiza
    await conexao.query(
      `UPDATE favorito_obra SET ativo = 1 WHERE id_usu = ? AND id_obr = ?`,
      [id_usu, id_obr]
    );
  } else {
    // não existe → insere
    await conexao.query(
      `INSERT INTO favorito_obra (id_usu, id_obr, ativo) VALUES (?, ?, 1)`,
      [id_usu, id_obr]
    );
  }
}
async function desfavoritarObra(id_usu, id_obr) {
  const conexao = await conectarBD();
  const sql = `UPDATE favorito_obra SET ativo = 0 WHERE id_usu = ? AND id_obr = ?`;
  await conexao.query(sql, [id_usu, id_obr]);
}
async function buscarObrasFavoritas(id_usu) {
  const conexao = await conectarBD();
  const sql = `
    SELECT 
    o.id_obr AS id, o.titulo_obr AS nome, a.nome_usu AS art, COALESCE(o.foto_obr, '/uploads/imagem.png') AS foto
    FROM favorito_obra f
    INNER JOIN obra o ON f.id_obr = o.id_obr
    INNER JOIN artista a ON o.id_art = a.id_art
    WHERE f.id_usu = ? AND f.ativo = 1`;
  const [linhas] = await conexao.query(sql, [id_usu]);
  return linhas;
}

// Comentários
async function buscarComentariosPorObra(id_obr) {
  const conexao = await conectarBD();
  const sql = `
    SELECT 
    c.id_com AS id_com, 
    c.id_usu AS id_usu, 
    c.id_obr AS id_obr,
    texto_com as texto,
    u.nome_usu AS usu,
    u.nome_comp as nome,
    u.foto_usu as foto
    FROM comentario c
    INNER JOIN usuario u ON C.id_usu = u.id_usu
    WHERE id_obr = ?`;
  const [linhas] = await conexao.query(sql, [id_obr]);
  return linhas;
}
async function comentarObra(id_usu, id_obr, comentario) {
  const conexao = await conectarBD();
  const sql = `INSERT INTO comentario (id_usu, id_obr, texto_com) VALUES (?, ?, ?)`;
  await conexao.query(sql, [id_usu, id_obr, comentario]);
}
async function excluirComentario(id_com) {
  const conexao = await conectarBD();
  const sql = `delete from comentario where id_com = ?`;
  await conexao.query(sql, [id_com]);
}

//Coleções
async function buscarObrasPorColecao(id_col) {
  const conexao = await conectarBD();
  const [obras] = await conexao.query(
    `
    SELECT 
      col.id_col AS id_col,
      col.nome_col AS nome_colecao,
      usu.id_usu AS id_usu,
      usu.nome_comp AS nome_usuario,
      obr.id_obr AS id_obr,
      obr.titulo_obr AS titulo,
      obr.foto_obr AS foto
    FROM colecao col
    INNER JOIN usuario usu ON col.id_usu = usu.id_usu
    LEFT JOIN obra_colecao oc ON col.id_col = oc.id_col
    LEFT JOIN obra obr ON oc.id_obr = obr.id_obr
    WHERE col.id_col = ?
  `,
    [id_col]
  );
  return obras;
}
async function buscarColecaoPorUsu(id_usu) {
  const conexao = await conectarBD();
  const sql = `
    SELECT 
      c.nome_col AS nome_colecao,
      c.id_col AS id_colecao,
      u.id_usu as id_usu,
      u.nome_comp AS nome_completo,
      COALESCE(o.foto_obr, '/uploads/imagem.png') AS foto_obra
    FROM colecao c
    JOIN usuario u ON c.id_usu = u.id_usu
    LEFT JOIN obra_colecao oc ON c.id_col = oc.id_col
    LEFT JOIN obra o ON oc.id_obr = o.id_obr
    WHERE c.id_usu = ?
    GROUP BY c.id_col
  `;
  const [linhas] = await conexao.query(sql, [id_usu]);
  return linhas;
}
async function criarColecao(id_usu, nome_col) {
  try {
    const conexao = await conectarBD();
    console.log("Parâmetros recebidos:", id_usu, nome_col);

    const [resultado] = await conexao.query(
      "INSERT INTO colecao (id_usu, nome_col) VALUES (?, ?)",
      [id_usu, nome_col]
    );
    return resultado.insertId;
  } catch (erro) {
    console.error("Erro ao criar coleção:", erro);
    throw erro; // Propaga o erro para quem chamou
  }
}
async function excluirColecao(id_col) {
  const conexao = await conectarBD();
  // Primeiro, excluir todas as relações dessa coleção com obras
  await conexao.query("DELETE FROM obra_colecao WHERE id_col = ?", [id_col]);
  // Agora sim, pode excluir a coleção
  await conexao.query("DELETE FROM colecao WHERE id_col = ?", [id_col]);
}
async function atualizarColecao(id_col, novo_nome) {
  const conexao = await conectarBD();
  const sql = `
    UPDATE colecao SET nome_col = ? WHERE id_col = ?
  `;
  await conexao.query(sql, [novo_nome, id_col]);
}

async function adicionarObraColecao(id_col, id_obra) {
  const conexao = await conectarBD();
  const sql = `
    INSERT INTO obra_colecao (id_obr, id_col)
    VALUES (?, ?)
  `;
  await conexao.query(sql, [id_obra, id_col]);
}
async function excluirObraColecao(id_col, id_obra) {
  const conexao = await conectarBD();
  const sql = `
    DELETE FROM obra_colecao
    WHERE id_obr = ? AND id_col = ?
  `;
  await conexao.query(sql, [id_obra, id_col]); // <- CORRETO!
}

// Suporte
async function inserirSuporte(email_sup, assunto_sup, descricao_sup) {
  const conexao = await conectarBD();
  const sql = `INSERT INTO suporte (email_sup, assunto_sup, descricao_sup) VALUES (?, ?, ?)`;
  await conexao.query(sql, [email_sup, assunto_sup, descricao_sup]);
}
async function buscarSuporte(email, assunto, descricao) {
  const conexao = await conectarBD();
  const sql = `SELECT email_sup, assunto_sup, descricao_sup 
    FROM suporte 
    WHERE email_sup = ? AND assunto_sup = ? AND descricao_sup = ?`;
  const [linhas] = await conexao.query(sql, [email, assunto, descricao]);
  return linhas.length > 0 ? linhas[0] : null;
}

//ADMIN
async function buscarQtdApreciadores() {
  const conexao = await conectarBD();
  const sql = `SELECT COUNT(*) AS total FROM usuario WHERE tipo_usu = 'apr'`;
  const [linhas] = await conexao.query(sql);
  return linhas[0].total;
}
async function buscarQtdArtistas() {
  const conexao = await conectarBD();
  const sql = `SELECT COUNT(*) AS total FROM artista`;
  const [linhas] = await conexao.query(sql);
  return linhas[0].total;
}
async function buscarQtdArtistasAguardandoLiberacao() {
  const conexao = await conectarBD();
  const sql = `SELECT COUNT(*) AS total FROM liberacao_artista WHERE status_lib = 'p'`;
  const [linhas] = await conexao.query(sql);
  return linhas[0].total;
}
async function buscarQtdArtistasLiberados() {
  const conexao = await conectarBD();
  const sql = `SELECT COUNT(*) AS total FROM liberacao_artista WHERE status_lib = 'l'`;
  const [linhas] = await conexao.query(sql);
  return linhas[0].total;
}
async function buscarQtdAdm() {
  const conexao = await conectarBD();
  const sql = `SELECT COUNT(*) AS total FROM usuario WHERE tipo_usu = 'adm'`;
  const [linhas] = await conexao.query(sql);
  return linhas[0].total;
}
async function buscarQtdBan() {
  const conexao = await conectarBD();
  const sql = `SELECT COUNT(*) AS total FROM usuario WHERE ban_usu = 1`;
  const [linhas] = await conexao.query(sql);
  return linhas[0].total;
}
async function buscarTotalUsuarios() {
  const conexao = await conectarBD();
  const sql = `SELECT COUNT(*) AS total FROM usuario`;
  const [linhas] = await conexao.query(sql);
  return linhas[0].total;
}

// ADMIN - LISTAS
async function listarUsuarios() {
  const conexao = await conectarBD();
  const sql = ` SELECT id_usu as id, nome_usu as usu, nome_comp as nome, email_usu as email, foto_usu as foto, tipo_usu as tipo, advertencia_usu as adv, ban_usu as ban
    FROM usuario
    ORDER BY id_usu DESC `;
  const [linhas] = await conexao.query(sql);
  return linhas;
}
async function listarApreciadores() {
  const conexao = await conectarBD();
  const sql = `SELECT id_usu AS id, nome_usu AS usu, nome_comp AS nome, foto_usu AS foto, tipo_usu AS tipo
    FROM usuario
    WHERE tipo_usu = 'apr'
    ORDER BY id_usu DESC`;
  const [linhas] = await conexao.query(sql);
  return linhas;
}
async function listarArtistasAtivos() {
  const conexao = await conectarBD();
  const sql = `
    SELECT 
        a.id_art AS id,
        a.nome_usu AS usu,
        a.nome_comp AS nome,
        a.bio_art AS bio,
        u.email_usu AS email,
        COALESCE(a.foto_art, u.foto_usu, '/uploads/imagem.png') AS foto,
        CASE 
            WHEN u.id_usu IS NOT NULL THEN u.tipo_usu 
            ELSE 'art' 
        END AS tipo,
        COALESCE(u.advertencia_usu, 0) AS adv,
        COALESCE(u.ban_usu, 0) AS ban
    FROM 
        artista a
    LEFT JOIN 
        usuario u ON a.id_usu = u.id_usu
    ORDER BY 
        a.id_art DESC;
  `;
  const [linhas] = await conexao.query(sql);
  return linhas;
}
async function listarArtistasLiberados() {
  const conexao = await conectarBD();
  const sql = `SELECT a.id_art AS id, a.nome_usu AS usu, a.nome_comp AS nome, a.foto_art AS foto, l.status_lib AS status
    FROM artista a
    INNER JOIN liberacao_artista l ON a.id_usu = l.id_usu
    WHERE l.status_lib = 'l'
    ORDER BY a.id_art DESC`;
  const [linhas] = await conexao.query(sql);
  return linhas;
}
async function listarArtistasAguardandoLiberacao() {
  const conexao = await conectarBD();
  const sql = `
    SELECT 
      u.id_usu AS id,
      u.nome_usu AS usu,
      u.nome_comp AS nome,
      u.email_usu AS email,
      u.foto_usu AS foto,
      u.tipo_usu AS tipo,
      u.advertencia_usu AS adv,
      u.ban_usu AS ban,
      l.status_lib AS status
    FROM usuario u
    INNER JOIN liberacao_artista l ON u.id_usu = l.id_usu
    WHERE l.status_lib = 'p'
    ORDER BY u.id_usu DESC
  `;
  const [linhas] = await conexao.query(sql);
  return linhas;
}
async function listarAdministradores() {
  const conexao = await conectarBD();
  const sql = `SELECT id_usu AS id, nome_usu AS usu, nome_comp AS nome, foto_usu AS foto, tipo_usu AS tipo
    FROM usuario
    WHERE tipo_usu = 'adm'
    ORDER BY id_usu DESC`;
  const [linhas] = await conexao.query(sql);
  return linhas;
}
async function listarUsuariosBanidos() {
  const conexao = await conectarBD();
  const sql = `SELECT id_usu AS id, nome_usu AS usu, nome_comp AS nome, foto_usu AS foto, tipo_usu AS tipo
    FROM usuario
    WHERE ban_usu = 1
    ORDER BY id_usu DESC`;
  const [linhas] = await conexao.query(sql);
  return linhas;
}

// ADMIN - Ações diretas
async function liberarArtista(id_usu) {
  const conexao = await conectarBD();
  const sql = `UPDATE liberacao_artista SET status_lib = 'l' WHERE id_usu = ?`;
  await conexao.query(sql, [id_usu]);
}
async function advertirUsuario(id_usu) {
  const conexao = await conectarBD();
  const sql = `UPDATE usuario SET advertencia_usu = advertencia_usu + 1 WHERE id_usu = ?`;
  await conexao.query(sql, [id_usu]);
}
async function banirUsuario(id_usu) {
  const conexao = await conectarBD();
  const sql = `UPDATE usuario SET ban_usu = 1 WHERE id_usu = ?`;
  await conexao.query(sql, [id_usu]);
}

async function verificarEmailExiste(email) {
  const conexao = await conectarBD();
  const [resultado] = await conexao.query(
    "SELECT email_usu FROM usuario WHERE email_usu = ?",
    [email]
  );
  return resultado.length > 0;
}

//Segui ou Deixa de seguir
async function seguirUsuario(seguidorId, seguidoId) {
  const conexao = await conectarBD();
  const sql = `INSERT IGNORE INTO seguidores (seguidor_id, seguido_id) VALUES (?, ?)`;
  await conexao.query(sql, [seguidorId, seguidoId]);
}

async function deixarDeSeguirUsuario(seguidorId, seguidoId) {
  const conexao = await conectarBD();
  const sql = `DELETE FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?`;
  await conexao.query(sql, [seguidorId, seguidoId]);
}

async function estaSeguindo(seguidorId, seguidoId) {
  const conexao = await conectarBD();
  const sql = `SELECT 1 FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?`;
  const [rows] = await conexao.query(sql, [seguidorId, seguidoId]);
  return rows.length > 0;
}

async function getUsuarioPorId(id) {
  const conexao = await conectarBD();
  const sql = `SELECT * FROM usuario WHERE id_usu = ?`;
  const [[usuario]] = await conexao.query(sql, [id]);
  return usuario;
}

async function getQtdSeguidores(id) {
  const conexao = await conectarBD();
  const sql = `SELECT total_seguidores FROM qtd_seguidores WHERE id_usu = ?`;
  const [[res]] = await conexao.query(sql, [id]);
  return res ? res.total_seguidores : 0;
}

async function getQtdSeguindo(id) {
  const conexao = await conectarBD();
  const sql = `SELECT total_seguindo FROM qtd_seguindo WHERE id_usu = ?`;
  const [[res]] = await conexao.query(sql, [id]);
  return res ? res.total_seguindo : 0;
}

module.exports = {
  conectarBD,
  buscarUsuario,
  registrarUsuario,
  buscarDadosUsuario,
  buscarDadosUsuarioPorId,
  buscarArtista,
  buscarArtistasPorCategoriaDeObra,
  buscarTodasCategorias,
  buscarUmaCategoria,
  buscarInicioCategorias,
  buscarTodasObras,
  buscarUmaObra,
  buscarUmaObraDetalhada,
  buscarObrasPorCategoria,
  buscarObrasPorCategoria9,
  buscarInicioObras,
  buscarObraAletoria,
  buscarObraMaisComentada,
  buscarObraMaisFavoritada,
  buscarObraMaisFavoritadaDoArtistaMaisSeguido,
  buscarColecoesPorUsuario,
  favoritarObra,
  contarFavoritos,
  jaFavoritou,
  desfavoritarObra,
  buscarObrasFavoritas,
  buscarComentariosPorObra,
  comentarObra,
  excluirComentario,
  buscarColecaoPorUsu,
  buscarObrasPorColecao,
  criarColecao,
  excluirColecao,
  atualizarColecao,
  adicionarObraColecao,
  excluirObraColecao,
  buscarSuporte,
  inserirSuporte,
  // Admin
  buscarQtdApreciadores,
  buscarQtdArtistas,
  buscarQtdArtistasAguardandoLiberacao,
  buscarQtdArtistasLiberados,
  buscarQtdAdm,
  buscarQtdBan,
  buscarTotalUsuarios,
  //Listas
  listarUsuarios,
  listarApreciadores,
  listarArtistasAtivos,
  listarArtistasLiberados,
  listarArtistasAguardandoLiberacao,
  listarAdministradores,
  listarUsuariosBanidos,
  //Funções ADM
  liberarArtista,
  advertirUsuario,
  banirUsuario,
  verificarEmailExiste,
  seguirUsuario,
  deixarDeSeguirUsuario,
  estaSeguindo,
  getUsuarioPorId,
  getQtdSeguidores,
  getQtdSeguindo,
};
