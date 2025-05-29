const request = require('supertest');
const express = require('express');
const session = require('express-session');
const suporteRouter = require("../../routes/suporte");

jest.mock("../../banco", () => ({
  inserirSuporte: jest.fn(),
}));

const banco = require("../../banco");

function createApp() {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    res.render = (view, data) => res.json({ view, data });
    next();
  });
  app.use('/supote', suporteRouter);
  return app;
}

describe('Rotas /suporte', () => {
  beforeEach(() => jest.clearAllMocks());

  //Testa se foi enviado e retorna sucesso
  //Testa se o usuário envia sem ter dados e retorna erro
  //Testa se não dá erro se o usuário sair da página antes de enviar

  
});