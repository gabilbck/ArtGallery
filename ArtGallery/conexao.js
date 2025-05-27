// conexao.js

const mysql = require('mysql2');

const conexao = mysql.createConnection({
    host: 'localhost',        // ou o host do seu banco
    user: 'seu_usuario',      // substitua pelo seu usuário
    password: 'sua_senha',    // substitua pela sua senha
    database: 'seu_banco'     // substitua pelo nome do seu banco
});

conexao.connect((erro) => {
    if (erro) {
        console.error('Erro ao conectar ao banco de dados:', erro);
    } else {
        console.log('Conectado ao banco de dados com sucesso!');
    }
});

module.exports = conexao;
