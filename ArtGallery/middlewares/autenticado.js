module.exports = function autenticado(req, res, next) {
  if (!req.session.usuario) {
    return res.redirect('/login');
  }
  next();
};
