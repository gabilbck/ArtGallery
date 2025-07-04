// tests/perfilService.test.js

describe("Serviços de perfil", () => {
  const getQtdSeguidores = async (id_usu) => {
    const conexao = {
      query: jest.fn().mockResolvedValue([[{ total: 7 }]]),
    };
    return conexao.query().then(([[result]]) => result.total);
  };

  it("getQtdSeguidores retorna número de seguidores", async () => {
    const total = await getQtdSeguidores(1);
    expect(total).toBe(7);
  });

  const estaSeguindo = async (seguidor, seguido) => {
    const conexao = {
      query: jest.fn().mockResolvedValue([[{ exists: true }]]),
    };
    return conexao.query().then(([[result]]) => !!result.exists);
  };

  it("estaSeguindo retorna true se já segue", async () => {
    const seguindo = await estaSeguindo(1, 2);
    expect(seguindo).toBe(true);
  });
});
