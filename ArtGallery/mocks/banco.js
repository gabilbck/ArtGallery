// banco.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuração da pool de conexões
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Funções do módulo
async function buscarDadosUsuarioPorId(id_usu) {
  const [rows] = await pool.query(
    'SELECT * FROM usuario WHERE id_usu = ?', 
    [id_usu]
  );
  return rows[0];
}

async function buscarColecaoPorUsu(id_usu) {
  const [rows] = await pool.query(
    'SELECT * FROM colecao WHERE id_usu = ?',
    [id_usu]
  );
  return rows;
}

async function buscarObrasPorColecao(id_col) {
  const [rows] = await pool.query(
    `SELECT o.* FROM obra o
     JOIN obra_colecao oc ON o.id_obr = oc.id_obr
     WHERE oc.id_col = ?`,
    [id_col]
  );
  return rows;
}

async function criarColecao(id_usu, nome_col) {
  const [result] = await pool.query(
    'INSERT INTO colecao (id_usu, nome_col) VALUES (?, ?)',
    [id_usu, nome_col]
  );
  return result.insertId;
}

async function excluirColecao(id_col) {
  const [result] = await pool.query(
    'DELETE FROM colecao WHERE id_col = ?',
    [id_col]
  );
  return result.affectedRows > 0;
}

async function atualizarColecao(id_col, novo_nome) {
  const [result] = await pool.query(
    'UPDATE colecao SET nome_col = ? WHERE id_col = ?',
    [novo_nome, id_col]
  );
  return result.affectedRows > 0;
}

async function adicionarObraColecao(id_col, id_obr) {
  const [result] = await pool.query(
    'INSERT INTO obra_colecao (id_col, id_obr) VALUES (?, ?)',
    [id_col, id_obr]
  );
  return result.affectedRows > 0;
}

async function excluirObraColecao(id_col, id_obr) {
  const [result] = await pool.query(
    'DELETE FROM obra_colecao WHERE id_col = ? AND id_obr = ?',
    [id_col, id_obr]
  );
  return result.affectedRows > 0;
}

// Função genérica para queries
async function query(sql, params) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

// Exportação das funções
module.exports = {
  buscarDadosUsuarioPorId,
  buscarColecaoPorUsu,
  buscarObrasPorColecao,
  criarColecao,
  excluirColecao,
  atualizarColecao,
  adicionarObraColecao,
  excluirObraColecao,
  query
};