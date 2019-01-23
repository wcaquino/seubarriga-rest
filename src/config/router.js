const express = require('express');

module.exports = (app) => {
  app.use('/auth', app.routes.auth);
  const protectedRouter = express.Router();

  protectedRouter.use('/users', app.routes.users);
  protectedRouter.use('/accounts', app.routes.accounts);
  protectedRouter.use('/transactions', app.routes.transactions);
  protectedRouter.use('/transfers', app.routes.transfers);
  protectedRouter.use('/balance', app.routes.balance);

  app.use('/v1', app.config.passport.authenticate(), protectedRouter);

  // app.get('/v2/users', (req, res) => res.status(200).send('V2 no ar'));
  app.use('/v2', protectedRouter);
};
