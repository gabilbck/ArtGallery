function validarSessao(req, res){
  if (!req.session.usuario) return res.redirect("/login");
}

function validarPermissaoAdm(req, res) {
  if (!req.session.usuario) return res.redirect("/login");
  const tipo_usu = req.session.usuario.tipo_usu;
  if (tipo_usu !== "adm") return res.redirect("/");
}

module.exports ={
  validarSessao,
  validarPermissaoAdm
}