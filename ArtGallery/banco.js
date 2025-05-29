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

        const conexao = await conectarBD();

        const sql = 'INSERT INTO usuario (email_usu, nome_comp, nome_usu, senha_usu, tipo_usu) VALUES (?, ?, ?, ?, ?)';
    

        try{
            const [resultado] = await conexao.execute(sql, [email, nome, usuario, senha, tipo_usu]);
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

// Favoritos
    async function favoritarObra(id_usu, id_obr) {
        const conexao = await conectarBD();
        const sql = `INSERT INTO favorito_obra (id_usu, id_obr, ativo) VALUES (?, ?, 1)`;
        await conexao.query(sql, [id_usu, id_obr]);
    }

// Comentários
    async function buscarComentariosPorObra(id_obr) {
        const conexao = await conectarBD();
        const sql = `SELECT id_com, id_usu, comentario, data_com FROM comentario WHERE id_obr = ?`;
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
    buscarTodasObras, buscarUmaObra, buscarUmaObraDetalhada, buscarObrasPorCategoria, buscarObrasPorCategoria9, buscarInicioObras, buscarObraAletoria,
    buscarComentariosPorObra, comentarObra,
    favoritarObra,
    buscarSuporte, inserirSuporte
 }; 