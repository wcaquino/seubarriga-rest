module.exports = function RecursoIndevidoError(message = 'Este recurso não pertence ao usuário') {
  this.name = 'RecursoIndevidoError';
  this.message = message;
};
