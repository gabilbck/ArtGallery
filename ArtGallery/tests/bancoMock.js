// No topo do arquivo, antes de usar mockDb
const mockDb = {
  conectarBD: jest.fn(),
  buscarDadosUsuarioPorId: jest.fn(),
  buscarObrasFavoritas: jest.fn(),
  buscarColecoesPorUsuario: jest.fn(),
  getQtdSeguidores: jest.fn(),
  getQtdSeguindo: jest.fn(),
  estaSeguindo: jest.fn(),
  seguirUsuario: jest.fn(),
  deixarDeSeguirUsuario: jest.fn(),
};
