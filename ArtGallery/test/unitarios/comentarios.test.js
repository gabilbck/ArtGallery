/**
 * @jest-environment node
 */

const request = require('supertest');
const express = require('express');
const session = require('express-session');

const obrasRouter = require('../routes/obras');

function createApp({ logged = false } = {}) {
  const app = express();
  app.use(express.json());
  app.use(session({ secret: 'test', resave: false, saveUninitialized: true }));
  if (logged) {
    app.use((req, res, next) => {
      req.session.usuario = { id: 1, nome: 'Tester' };
      next();
    });
  }
  app.use('/obras', obrasRouter);
  return app;
}

describe('Rotas de comentários /obras/comentar/:id', () => {
  test('redireciona para /login quando não autenticado', async () => {
    const app = createApp();
    const res = await request(app).get('/obras/comentar/1');
    expect(res.status).toBe(302);
    expect(res.header.location).toBe('/login');
  });

  test('redireciona de volta para a obra após comentar', async () => {
    const app = createApp({ logged: true });
    const res = await request(app)
      .get('/obras/comentar/1')
      .set('Referer', '/obras/1');
    expect(res.status).toBe(302);
    expect(res.header.location).toBe('/obras/1');
  });
});
