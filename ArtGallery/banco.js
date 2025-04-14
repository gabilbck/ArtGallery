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

async function buscarUsuario(usuario) { 
    const conexao = await conectarBD(); 
    const sql = `SELECT id_usu, nome_usu, email_usu 
                 FROM usuario 
                 WHERE email_usu = ? AND senha_usu = ?`; 
    const [linhas] = await conexao.query(sql, [usuario.email, usuario.senha]); 
    return linhas.length > 0 ? linhas[0] : null; 
} 

module.exports = { buscarUsuario, conectarBD }; 