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

// Categorias
    async function buscarTodasCategorias() {
        const conexao = await conectarBD();
        const sql = `SELECT id_cat AS id_categoria, nome_cat AS nome, foto_cat AS id_imagem FROM categoria`;
        const [linhas] = await conexao.query(sql);
        return linhas;
    }
    async function buscarCategoria(){
        const conexao = await conectarBD();
        const sql = `select id_cat, nome_cat, descricao_cat, foto_cat
                    from categoria
                    where id_cat= ?`;
        const [linhas] = await conexao.query(sql, [categoria.nome,  categoria.descricao, categoria.foto]);
        return linhas.length > 0 ? linhas[0] : null;
    }

// Obras
    async function buscarTodasObras(){
        const conecao = await conectarBD();
        const sql = `select id_obr`;
    }

// Comentários

// Imagens
async function buscarImagemPorId(id) {
    const sql = "SELECT foto_cat FROM categoria WHERE id_cat = ?";
    const [rows] = await conexao.promise().query(sql, [id]);
    if (rows.length > 0) {
        return rows[0].foto_cat;  // Isso será um Buffer com o binário da imagem
        } else {
        throw new Error("Imagem não encontrada");
    }
}

module.exports = { 
    buscarUsuario, 
    conectarBD, 
    buscarTodasCategorias, buscarCategoria,
    buscarTodasObras,
    buscarImagemPorId
 }; 