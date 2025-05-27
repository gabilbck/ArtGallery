//ROTA para receber POST do formulario de cadastro do usuario
const express = require('express');
const router = express.Router();
const { registrarUsuario} = require('../banco');

router.post('/', async (req, res) =>{
  const { email, nome, usuario, senha, tipo_usu} = req.body;

  try{
    await registrarUsuario({ email, nome, usuario, senha, tipo_usu});
    res.redirect('/login');
  } catch(erro){
    res.status(500).send('Erro ao cadastrar Usuario');
  }
});

module.exports = router;

