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
        const sql = `SELECT id_cat AS id, nome_cat AS nome FROM categoria`;
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

// Comentários

// Imagens
/**
 * Busca BLOB de imagem em qualquer tabela.
 * @param {string} tabela    Nome da tabela.
 * @param {string} idColuna Nome da coluna de ID.
 * @param {number|string} id Valor do ID.
 * @param {string} blobColuna Nome da coluna BLOB.
 * @returns {Buffer|null}
 */
async function buscarImagem(tabela, idColuna, id, blobColuna) {
  const conexao = await conectarBD();
  const sql = `SELECT \`${blobColuna}\` FROM \`${tabela}\` WHERE \`${idColuna}\` = ?`;
  const [linhas] = await conexao.query(sql, [id]);
  if (linhas.length === 0 || !linhas[0][blobColuna]) return null;
  return linhas[0][blobColuna];
}
/**
 * Insere/atualiza um campo BLOB em uma tabela.
 * @param {string} tabela    Nome da tabela
 * @param {string} idColuna    Nome da coluna de ID
 * @param {number} id       Valor do ID
 * @param {string} blobColuna  Nome da coluna BLOB
 * @param {Buffer} buffer   Buffer da imagem
 */
async function inserirImagem(tabela, idColuna, id, blobColuna, buffer) {
  const conexao = await conectarBD();
  const sql = `
    UPDATE \`${tabela}\` 
    SET \`${blobColuna}\` = ? 
    WHERE \`${idColuna}\` = ?
  `;
  await conexao.query(sql, [buffer, id]);
}

module.exports = { 
    conectarBD, 
    buscarUsuario, 
    buscarTodasCategorias,
    buscarTodasObras,
    buscarImagem, inserirImagem
 }; 