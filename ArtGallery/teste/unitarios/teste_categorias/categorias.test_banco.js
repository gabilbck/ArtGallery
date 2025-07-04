const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

// Mock database connection
const dbConnectionMock = {
   query: sinon.stub(),
};

// Import database functions with mocked connection
const { buscarTodasCategorias, buscarUmaCategoria, buscarObrasPorCategoria9 } =
   proxyquire("../../banco", {
      "./dbConnection": dbConnectionMock,
   });

describe("Database Functions - Categorias", () => {
   beforeEach(() => {
      // Reset stub before each test
      dbConnectionMock.query.reset();
   });

   describe("buscarTodasCategorias", () => {
      it("should return all categories from database", async () => {
         // Arrange
         const mockCategorias = [
            { id: 1, nome: "Pintura", foto: "/uploads/pintura.jpg" },
            { id: 2, nome: "Escultura", foto: "/uploads/escultura.jpg" },
         ];
         dbConnectionMock.query.resolves(mockCategorias);

         // Act
         const result = await buscarTodasCategorias();

         // Assert
         expect(dbConnectionMock.query.calledOnce).to.be.true;
         expect(result).to.deep.equal(mockCategorias);
         expect(dbConnectionMock.query.firstCall.args[0]).to.include(
            "SELECT * FROM categorias"
         );
      });

      it("should throw an error when database query fails", async () => {
         // Arrange
         const dbError = new Error("Database connection error");
         dbConnectionMock.query.rejects(dbError);

         // Act & Assert
         try {
            await buscarTodasCategorias();
            // If we reach here, test should fail
            expect.fail("Function should have thrown an error");
         } catch (error) {
            expect(error).to.equal(dbError);
            expect(dbConnectionMock.query.calledOnce).to.be.true;
         }
      });

      it("should handle empty result set", async () => {
         // Arrange
         dbConnectionMock.query.resolves([]);

         // Act
         const result = await buscarTodasCategorias();

         // Assert
         expect(result).to.be.an("array").that.is.empty;
      });

      it("should handle null values in category data", async () => {
         // Arrange
         const mockCategorias = [
            { id: 1, nome: "Test", foto: null },
            { id: 2, nome: null, foto: "/test.jpg" },
         ];
         dbConnectionMock.query.resolves(mockCategorias);

         // Act
         const result = await buscarTodasCategorias();

         // Assert
         expect(result).to.deep.equal(mockCategorias);
      });
   });

   describe("buscarUmaCategoria", () => {
      it("should return a single category by id", async () => {
         // Arrange
         const categoriaId = 3;
         const mockCategoria = {
            id: 3,
            nome: "Fotografia",
            desc: "Arte fotográfica",
            foto: "/uploads/fotografia.jpg",
         };
         dbConnectionMock.query.resolves([mockCategoria]);

         // Act
         const result = await buscarUmaCategoria(categoriaId);

         // Assert
         expect(dbConnectionMock.query.calledOnce).to.be.true;
         expect(result).to.deep.equal(mockCategoria);
         expect(dbConnectionMock.query.firstCall.args[0]).to.include(
            "SELECT * FROM categorias WHERE id = ?"
         );
         expect(dbConnectionMock.query.firstCall.args[1]).to.deep.equal([
            categoriaId,
         ]);
      });

      it("should return null when category is not found", async () => {
         // Arrange
         const categoriaId = 999;
         dbConnectionMock.query.resolves([]);

         // Act
         const result = await buscarUmaCategoria(categoriaId);

         // Assert
         expect(dbConnectionMock.query.calledOnce).to.be.true;
         expect(result).to.be.null;
      });

      it("should throw an error when database query fails", async () => {
         // Arrange
         const categoriaId = 3;
         const dbError = new Error("Database connection error");
         dbConnectionMock.query.rejects(dbError);

         // Act & Assert
         try {
            await buscarUmaCategoria(categoriaId);
            // If we reach here, test should fail
            expect.fail("Function should have thrown an error");
         } catch (error) {
            expect(error).to.equal(dbError);
            expect(dbConnectionMock.query.calledOnce).to.be.true;
         }
      });

      it("should handle invalid category ID types", async () => {
         // Arrange
         const invalidId = "not-a-number";
         dbConnectionMock.query.resolves([]);

         // Act
         const result = await buscarUmaCategoria(invalidId);

         // Assert
         expect(result).to.be.null;
      });
   });

   describe("buscarObrasPorCategoria9", () => {
      it("should return up to 9 works for a given category", async () => {
         // Arrange
         const categoriaId = 2;
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
            {
               id: 3,
               nome: "Obra 3",
               art: "Artista 3",
               foto: "/uploads/obra3.jpg",
            },
         ];
         dbConnectionMock.query.resolves(mockObras);

         // Act
         const result = await buscarObrasPorCategoria9(categoriaId);

         // Assert
         expect(dbConnectionMock.query.calledOnce).to.be.true;
         expect(result).to.deep.equal(mockObras);
         expect(dbConnectionMock.query.firstCall.args[0]).to.include(
            "SELECT * FROM obras WHERE categoria_id = ? LIMIT 9"
         );
         expect(dbConnectionMock.query.firstCall.args[1]).to.deep.equal([
            categoriaId,
         ]);
      });

      it("should return empty array when no works found for category", async () => {
         // Arrange
         const categoriaId = 999;
         dbConnectionMock.query.resolves([]);

         // Act
         const result = await buscarObrasPorCategoria9(categoriaId);

         // Assert
         expect(dbConnectionMock.query.calledOnce).to.be.true;
         expect(result).to.be.an("array").that.is.empty;
      });

      it("should throw an error when database query fails", async () => {
         // Arrange
         const categoriaId = 2;
         const dbError = new Error("Database connection error");
         dbConnectionMock.query.rejects(dbError);

         // Act & Assert
         try {
            await buscarObrasPorCategoria9(categoriaId);
            // If we reach here, test should fail
            expect.fail("Function should have thrown an error");
         } catch (error) {
            expect(error).to.equal(dbError);
            expect(dbConnectionMock.query.calledOnce).to.be.true;
         }
      });

      it("should handle exactly 9 works", async () => {
         // Arrange
         const categoriaId = 1;
         const mockObras = Array.from({ length: 9 }, (_, i) => ({
            id: i + 1,
            nome: `Obra ${i + 1}`,
            art: `Artista ${i + 1}`,
            foto: `/uploads/obra${i + 1}.jpg`,
         }));
         dbConnectionMock.query.resolves(mockObras);

         // Act
         const result = await buscarObrasPorCategoria9(categoriaId);

         // Assert
         expect(result).to.have.lengthOf(9);
      });

      it("should handle works with missing attributes", async () => {
         // Arrange
         const categoriaId = 1;
         const mockObras = [
            { id: 1, nome: "Obra 1", art: null, foto: null },
            { id: 2, nome: null, art: "Artista 2", foto: "/test.jpg" },
         ];
         dbConnectionMock.query.resolves(mockObras);

         // Act
         const result = await buscarObrasPorCategoria9(categoriaId);

         // Assert
         expect(result).to.deep.equal(mockObras);
      });
   });
});
