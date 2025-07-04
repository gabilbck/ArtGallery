const { expect } = require("chai");
const { JSDOM } = require("jsdom");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");

describe("Categorias View", () => {
   let templateString;
   let dom;

   before(() => {
      // Load the template file
      templateString = fs.readFileSync(
         path.resolve(__dirname, "../../views/categorias.ejs"),
         "utf8"
      );
   });

   beforeEach(() => {
      // Set up test data
      const data = {
         title: "Categorias – ArtGallery",
         usuario: { id: 1, nome: "Test User" },
         itens: [
            {
               id: 1,
               nome: "Pintura",
               foto: "/uploads/pintura.jpg",
               tabela: "categoria",
            },
            {
               id: 2,
               nome: "Escultura",
               foto: "/uploads/escultura.jpg",
               tabela: "categoria",
            },
            { id: 3, nome: "Fotografia", foto: null, tabela: "categoria" },
         ],
      };

      // Render the template
      const html = ejs.render(templateString, data);
      dom = new JSDOM(html);
   });

   it("should have the correct page title", () => {
      expect(dom.window.document.title).to.equal("Categorias – ArtGallery");
   });

   it("should display the correct number of categories", () => {
      const categoryElements =
         dom.window.document.querySelectorAll(".cat-container");
      expect(categoryElements.length).to.equal(3);
   });

   it("should create correct links to category detail pages", () => {
      const categoryLinks =
         dom.window.document.querySelectorAll(".conteudo .grid a");
      expect(categoryLinks.length).to.equal(3);
      expect(categoryLinks[0].href).to.include("/categorias/id=1");
      expect(categoryLinks[1].href).to.include("/categorias/id=2");
      expect(categoryLinks[2].href).to.include("/categorias/id=3");
   });

   it("should display category names correctly", () => {
      const categoryNames = dom.window.document.querySelectorAll(
         ".cat-container span"
      );
      expect(categoryNames[0].textContent).to.equal("Pintura");
      expect(categoryNames[1].textContent).to.equal("Escultura");
      expect(categoryNames[2].textContent).to.equal("Fotografia");
   });

   it("should use the default image when category has no image", () => {
      const categoryImages =
         dom.window.document.querySelectorAll(".cat-container img");
      expect(categoryImages[2].src).to.include("/uploads/imagem.png");
   });

   it("should use the provided image when category has an image", () => {
      const categoryImages =
         dom.window.document.querySelectorAll(".cat-container img");
      expect(categoryImages[0].src).to.include("/uploads/pintura.jpg");
      expect(categoryImages[1].src).to.include("/uploads/escultura.jpg");
   });

   it("should have navigation links in the header", () => {
      const navLinks = dom.window.document.querySelectorAll(".nav-icone a");
      expect(navLinks.length).to.be.at.least(4);

      const navHrefs = Array.from(navLinks).map((link) =>
         link.getAttribute("href")
      );
      expect(navHrefs).to.include("/");
      expect(navHrefs).to.include("/explorar");
      expect(navHrefs).to.include("/categorias");
      expect(navHrefs).to.include("/perfil");
   });

   it("should have a search input field", () => {
      const searchInput = dom.window.document.querySelector(".pesquisa input");
      expect(searchInput).to.exist;
      expect(searchInput.getAttribute("placeholder")).to.include(
         "Encontre seus artistas favoritos"
      );
   });

   it("should display developer information in the footer", () => {
      const devLinks = dom.window.document.querySelectorAll(".dev-linha a");
      expect(devLinks.length).to.equal(3);

      const devGithubs = Array.from(devLinks).map((link) =>
         link.getAttribute("href")
      );
      expect(devGithubs).to.include("https://github.com/gabilbck");
      expect(devGithubs).to.include("https://github.com/JulioMattoos");
      expect(devGithubs).to.include("https://github.com/MileineFreitas");
   });

   it("should handle empty category list", () => {
      const emptyData = {
         title: "Categorias – ArtGallery",
         usuario: { id: 1, nome: "Test User" },
         itens: [],
      };

      const html = ejs.render(templateString, emptyData);
      const emptyDom = new JSDOM(html);

      const categoryElements =
         emptyDom.window.document.querySelectorAll(".cat-container");
      expect(categoryElements.length).to.equal(0);
   });

   it("should have correct search functionality elements", () => {
      const searchContainer = dom.window.document.querySelector(".pesquisa");
      expect(searchContainer).to.exist;

      const searchIcon = searchContainer.querySelector("svg");
      expect(searchIcon).to.exist;

      const searchInput = searchContainer.querySelector("input");
      expect(searchInput).to.exist;
      expect(searchInput.id).to.equal("pesquisa");
   });

   it("should have proper footer links", () => {
      const footer = dom.window.document.querySelector("footer");
      expect(footer).to.exist;

      const supportLink = footer.querySelector('a[href="/suporte"]');
      expect(supportLink).to.exist;

      const homeLink = footer.querySelector('a[href="/"]');
      expect(homeLink).to.exist;
      expect(homeLink.textContent).to.include("ArtGallery");
   });
});
