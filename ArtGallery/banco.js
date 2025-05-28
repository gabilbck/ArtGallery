const mysql = require('mysql2/promise'); 

async function conectarBD() { 
    if (global.conexao && global.conexao.state !== 'DESCONECTADO') { 
        return global.conexao; 
    } 

    const conexao = await mysql.createConnection({ 
        host: 'localhost', 
        port: 3306, 
        user: 'root', 
        password: '', 
        database: 'artg' 
    }); 

    console.log('Conectou ao MySQL!'); 
    global.conexao = conexao; 
    return conexao; 
} 

// Usuários
    async function buscarUsuario(usuario) { 
        const conexao = await conectarBD(); 
        const sql = `SELECT id_usu, nome_usu, email_usu 
                    FROM usuario 
                    WHERE email_usu = ? AND senha_usu = ?`; 
        const [linhas] = await conexao.query(sql, [usuario.email, usuario.senha]); 
        return linhas.length > 0 ? linhas[0] : null; 
    } 
    async function registrarUsuario(dadosUsuario) {
        const{ email, nome, usuario, senha, tipo_usu} = dadosUsuario;
        const sql = 'INSERT INTO usuario (email, nome, usuario, senha, tipo_usu) VALUES (?, ?, ?, ?, ?)';
        try{
            const [resultado] = await conexao.promise().execute(sql, [email, nome, usuario, senha, tipo_usu]);
            console.log('Usuario cadastrado com sucesso: ', resultado);
            return resultado;
        }catch (erro){
            console.erro('Erro ao cadastrar usuario:', erro);
            throw erro;
        }
    };

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
        const sql = `SELECT id_cat AS id, nome_cat AS nome, foto_cat AS foto FROM categoria`;
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
    async function buscarTodasObras(){
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
        LIMIT 3`
        const [linhas] = await conexao.query(sql, [id]);
        return linhas;
    };
    async function buscarObraAletoria() {
        const conexao = await conectarBD();
        const sql = `
            SELECT 
                o.id_obr AS id,
                o.titulo_obr AS nome,
                a.nome_comp AS art,
                COALESCE(o.foto_obr, '/uploads/imagem.png') AS foto
            FROM obra o
            INNER JOIN artista a ON o.id_art = a.id_art
            WHERE o.situacao_obr = 1
            ORDER BY RAND()
            LIMIT 1
        `;
        const [linhas] = await conexao.query(sql);
        return linhas.length > 0 ? linhas[0] : null;
    };
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
        const [obras] = await conexao.query(`
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
        `, [idArtista]);

        return obras.length > 0 ? obras[0] : null;
    }


// Favoritos
    async function favoritarObra(id_usu, id_obr) {
        const conexao = await conectarBD();
        const sql = `INSERT INTO favorito_obra (id_usu, id_obr, ativo) VALUES (?, ?, 1)`;
        await conexao.query(sql, [id_usu, id_obr]);
    }
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
    async function desfavoritarObra(id_usu, id_obr) {
        const conexao = await conectarBD();
        const sql = `UPDATE favorito_obra SET ativo = 0 WHERE id_usu = ? AND id_obr = ?`;
        await conexao.query(sql, [id_usu, id_obr]);
    }
    async function favoritarObraComDesbloqueio(id_usu, id_obr) {
        const conexao = await conectarBD();
        const sql = `INSERT INTO favorito_obra (id_usu, id_obr, ativo) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE ativo = 1`;
        await conexao.query(sql, [id_usu, id_obr]);
    }

// Comentários
    async function buscarComentariosPorObra(id_obr) {
        const conexao = await conectarBD();
        const sql = `
            SELECT 
            c.id_com AS id_com, 
            c.id_usu AS id_usu, 
            c.id_obr AS id_obr,
            texto_com,
            u.nome_usu AS nome_usu
            FROM comentario c
            INNER JOIN usuario u ON C.id_usu = u.id_usu
            WHERE id_obr = ?`;
        const [linhas] = await conexao.query(sql, [id_obr]);
        return linhas;
    }
    async function comentarObra(id_usu, id_obr, comentario) {
        const conexao = await conectarBD();
        const sql = `INSERT INTO comentario (id_usu, id_obr, comentario) VALUES (?, ?, ?)`;
        await conexao.query(sql, [id_usu, id_obr, comentario]);
    }

// Suporte
    async function buscarSuporte() {
        const conexao = await conectarBD();
        const sql = `SELECT id_sup, email_sup, assunto_sup, descricao_sup FROM suporte`;
        const [linhas] = await conexao.query(sql);
        return linhas;
    }
    async function inserirSuporte(suporte) {
        const conexao = await conectarBD();
        const sql = `INSERT INTO suporte (email_sup, assunto_sup, descricao_sup) VALUES (?, ?, ?)`;
        await conexao.query(sql, [suporte.email, suporte.assunto, suporte.descricao]);
    }





module.exports = { 
    conectarBD, 
    buscarUsuario, registrarUsuario,
    buscarArtista, buscarArtistasPorCategoriaDeObra,
    buscarTodasCategorias, buscarInicioCategorias, buscarUmaCategoria,
    buscarTodasObras, buscarUmaObra, buscarUmaObraDetalhada, buscarObrasPorCategoria, buscarObrasPorCategoria9, buscarInicioObras, buscarObraAletoria, buscarObraMaisComentada, buscarObraMaisFavoritada, buscarObraMaisFavoritadaDoArtistaMaisSeguido,
    buscarComentariosPorObra, comentarObra,
    favoritarObra, contarFavoritos, jaFavoritou, desfavoritarObra, favoritarObraComDesbloqueio,
    buscarSuporte, inserirSuporte
 }; 