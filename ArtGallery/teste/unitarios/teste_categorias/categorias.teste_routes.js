const { expect } = require("chai");
const sinon = require("sinon");
const { createRequest, createResponse } = require("node-mocks-http");
const proxyquire = require("proxyquire");

// Mock database functions
const dbMock = {
   buscarTodasCategorias: sinon.stub(),
   buscarUmaCategoria: sinon.stub(),
   buscarObrasPorCategoria9: sinon.stub(),
};

// Import router with mocked dependencies
const categoriasRouter = proxyquire("../../routes/categorias", {
   "../banco": dbMock,
});

describe("Categorias Router", () => {
   let req, res;

   beforeEach(() => {
      // Reset stubs before each test
      dbMock.buscarTodasCategorias.reset();
      dbMock.buscarUmaCategoria.reset();
      dbMock.buscarObrasPorCategoria9.reset();

      // Create fresh request and response objects
      req = createRequest();
      res = createResponse();

      // Mock session
      req.session = {};
   });

   describe("GET /", () => {
      it("should redirect to login if user is not authenticated", () => {
         // Arrange
         req.session.usuario = null;

         // Act
         categoriasRouter.handle(req, res);

         // Assert
         expect(res.statusCode).to.equal(302);
         expect(res._getRedirectUrl()).to.equal("/login");
         expect(dbMock.buscarTodasCategorias.called).to.be.false;
      });

      it("should render categorias view with data if user is authenticated", async () => {
         // Arrange
         req.session.usuario = { id: 1, nome: "Test User" };
         const mockCategorias = [
            { id: 1, nome: "Categoria 1", foto: "/uploads/cat1.jpg" },
            { id: 2, nome: "Categoria 2", foto: "/uploads/cat2.jpg" },
         ];
         dbMock.buscarTodasCategorias.resolves(mockCategorias);

         // Act
         await categoriasRouter.handle(req, res);

         // Assert
         expect(dbMock.buscarTodasCategorias.calledOnce).to.be.true;
         expect(res._getRenderView()).to.equal("categorias");
         expect(res._getRenderData().title).to.equal("Categorias – ArtGallery");
         expect(res._getRenderData().usuario).to.deep.equal(
            req.session.usuario
         );
         expect(res._getRenderData().itens).to.have.lengthOf(2);
         expect(res._getRenderData().itens[0]).to.deep.equal({
            id: 1,
            nome: "Categoria 1",
            foto: "/uploads/cat1.jpg",
            tabela: "categoria",
         });
      });

      it("should handle database errors properly", async () => {
         // Arrange
         req.session.usuario = { id: 1, nome: "Test User" };
         const dbError = new Error("Database connection error");
         dbMock.buscarTodasCategorias.rejects(dbError);

         // Act
         await categoriasRouter.handle(req, res);

         // Assert
         expect(dbMock.buscarTodasCategorias.calledOnce).to.be.true;
         expect(res.statusCode).to.equal(500);
         expect(res._getData()).to.equal("Erro ao carregar categorias");
      });

      it("should handle empty category list", async () => {
         // Arrange
         req.session.usuario = { id: 1, nome: "Test User" };
         dbMock.buscarTodasCategorias.resolves([]);

         // Act
         await categoriasRouter.handle(req, res);

         // Assert
         expect(res._getRenderData().itens).to.be.an("array").that.is.empty;
      });

      it("should handle malformed session data", async () => {
         // Arrange
         req.session.usuario = { id: null, nome: undefined };
         const mockCategorias = [{ id: 1, nome: "Test", foto: "test.jpg" }];
         dbMock.buscarTodasCategorias.resolves(mockCategorias);

         // Act
         await categoriasRouter.handle(req, res);

         // Assert
         expect(res._getRenderData().usuario).to.deep.equal({
            id: null,
            nome: undefined,
         });
      });
   });

   describe("GET /:id", () => {
      beforeEach(() => {
         req.params = { id: "1" };
      });

      it("should redirect to login if user is not authenticated", () => {
         // Arrange
         req.session.usuario = null;

         // Act
         categoriasRouter.handle(req, res);

         // Assert
         expect(res.statusCode).to.equal(302);
         expect(res._getRedirectUrl()).to.equal("/login");
         expect(dbMock.buscarUmaCategoria.called).to.be.false;
      });

      it("should correctly parse ID parameter with id= format", async () => {
         // Arrange
         req.session.usuario = { id: 1, nome: "Test User" };
         req.params.id = "id=5";
         const mockCategoria = {
            id: 5,
            nome: "Categoria 5",
            desc: "Descrição",
            foto: "/uploads/cat5.jpg",
         };
         const mockObras = [
            {
               id: 1,
               nome: "Obra 1",
               art: "Artista 1",
               foto: "/uploads/obra1.jpg",
            },
         ];

         dbMock.buscarUmaCategoria.resolves(mockCategoria);
         dbMock.buscarObrasPorCategoria9.resolves(mockObras);

         // Act
         await categoriasRouter.handle(req, res);

         // Assert
         expect(dbMock.buscarUmaCategoria.calledWith("5")).to.be.true;
         expect(dbMock.buscarObrasPorCategoria9.calledWith("5")).to.be.true;
      });

      it("should correctly use ID parameter without id= format", async () => {
         // Arrange
         req.session.usuario = { id: 1, nome: "Test User" };
         req.params.id = "5";
         const mockCategoria = {
            id: 5,
            nome: "Categoria 5",
            desc: "Descrição",
            foto: "/uploads/cat5.jpg",
         };
         const mockObras = [
            {
               id: 1,
               nome: "Obra 1",
               art: "Artista 1",
               foto: "/uploads/obra1.jpg",
            },
         ];

         dbMock.buscarUmaCategoria.resolves(mockCategoria);
         dbMock.buscarObrasPorCategoria9.resolves(mockObras);

         // Act
         await categoriasRouter.handle(req, res);

         // Assert
         expect(dbMock.buscarUmaCategoria.calledWith("5")).to.be.true;
         expect(dbMock.buscarObrasPorCategoria9.calledWith("5")).to.be.true;
      });

      it("should render categoriasID view with correct data", async () => {
         // Arrange
         req.session.usuario = { id: 1, nome: "Test User" };
         const mockCategoria = {
            id: 1,
            nome: "Categoria 1",
            desc: "Descrição da categoria",
            foto: "/uploads/cat1.jpg",
         };
         const mockObras = [
            {
               id: 1,
               nome: "Obra 1",
               art: "Artista 1",
               foto: "/uploads/obra1.jpg",
            },
            {
               id: 2,
               nome: "Obra 2",
               art: "Artista 2",
               foto: "/uploads/obra2.jpg",
            },
         ];

         dbMock.buscarUmaCategoria.resolves(mockCategoria);
         dbMock.buscarObrasPorCategoria9.resolves(mockObras);

         // Act
         await categoriasRouter.handle(req, res);

         // Assert
         expect(res._getRenderView()).to.equal("categoriasID");
         expect(res._getRenderData().title).to.equal(
            "Categoria: Categoria 1 – ArtGallery"
         );
         expect(res._getRenderData().usuario).to.deep.equal(
            req.session.usuario
         );
         expect(res._getRenderData().categoria).to.deep.equal({
            id: 1,
            nome: "Categoria 1",
            desc: "Descrição da categoria",
            foto: "/uploads/cat1.jpg",
         });
         expect(res._getRenderData().obras9).to.have.lengthOf(2);
         expect(res._getRenderData().obras9[0]).to.deep.equal({
            id: 1,
            nome: "Obra 1",
            art: "Artista 1",
            foto: "/uploads/obra1.jpg",
            tabela: "obra",
         });
      });

      it("should return 404 when category is not found", async () => {
         // Arrange
         req.session.usuario = { id: 1, nome: "Test User" };
         dbMock.buscarUmaCategoria.resolves(null);

         // Act
         await categoriasRouter.handle(req, res);

         // Assert
         expect(res.statusCode).to.equal(404);
         expect(res._getData()).to.equal("Categoria não encontrada");
         expect(dbMock.buscarObrasPorCategoria9.called).to.be.false;
      });

      it("should handle database errors properly", async () => {
         // Arrange
         req.session.usuario = { id: 1, nome: "Test User" };
         const dbError = new Error("Database connection error");
         dbMock.buscarUmaCategoria.rejects(dbError);

         // Act
         await categoriasRouter.handle(req, res);

         // Assert
         expect(res.statusCode).to.equal(500);
         expect(res._getData()).to.equal("Erro ao carregar categoria ou obras");
      });

      it("should handle invalid category IDs", async () => {
         // Arrange
         req.session.usuario = { id: 1, nome: "Test User" };
         req.params.id = "invalid";

         // Act
         await categoriasRouter.handle(req, res);

         // Assert
         expect(dbMock.buscarUmaCategoria.calledWith("invalid")).to.be.true;
         expect(res.statusCode).to.equal(404);
      });

      it("should handle category with no works", async () => {
         // Arrange
         req.session.usuario = { id: 1, nome: "Test User" };
         const mockCategoria = {
            id: 1,
            nome: "Empty Category",
            desc: "No works",
            foto: "empty.jpg",
         };
         dbMock.buscarUmaCategoria.resolves(mockCategoria);
         dbMock.buscarObrasPorCategoria9.resolves([]);

         // Act
         await categoriasRouter.handle(req, res);

         // Assert
         expect(res._getRenderData().obras9).to.be.an("array").that.is.empty;
      });
   });
});
