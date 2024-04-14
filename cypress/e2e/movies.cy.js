import { expect } from "chai";
import { movieFixture } from "../fixtures/movieFixture";

describe("Cadastro de filmes", () => {
  describe("Quando o cadastro é bem sucedido", () => {
    it("Deve criar um filme", () => {
      cy.adminLogin().then(() => {
        cy.createRandomMovie().then((randomMovie) => {
          cy.request({
            method: "POST",
            url: "/movies",
            body: randomMovie,
            headers: {
              Authorization: `Bearer ${Cypress.env("accessToken")}`,
            },
          }).then((responseMovieCreated) => {
            const { body, status } = responseMovieCreated;
            expect(status).to.eq(201);
            expect(body).to.be.undefined;
          });
        });
      });
    });
  });

  describe("Quando o cadastro falha", () => {
    it("Deve retornar erro 400 (Bad Request) ao tentar criar um filme com informações de título incorretas", () => {
      cy.adminLogin().then(() => {
        cy.createRandomMovie().then((randomMovie) => {
          randomMovie.title = "";
          cy.request({
            method: "POST",
            url: "/movies",
            failOnStatusCode: false,
            body: randomMovie,
            headers: {
              Authorization: `Bearer ${Cypress.env("accessToken")}`,
            },
          }).then((response) => {
            const { body, status } = response;
            expect(status).to.eq(400);
            expect(body).to.deep.eq(movieFixture.errorTitleInvalid);
          });
        });
      });
    });
    it("Deve retornar erro 401 (Unauthorized) ao tentar criar um filme sem estar autenticado", () => {
      cy.createRandomMovie().then((randomMovie) => {
        cy.request({
          method: "POST",
          url: "/movies",
          failOnStatusCode: false,
          body: randomMovie,
        }).then((response) => {
          const { body, status } = response;
          expect(status).to.eq(401);
          expect(body).to.deep.eq(movieFixture.errorUnauthorized);
        });
      });
    });
    it("Deve retornar erro 403 (Forbidden) ao tentar criar um filme sem ser administrador", () => {
      cy.userLogin().then(() => {
        cy.createRandomMovie().then((randomMovie) => {
          cy.request({
            method: "POST",
            url: "/movies",
            failOnStatusCode: false,
            body: randomMovie,
            headers: {
              Authorization: `Bearer ${Cypress.env("accessToken")}`,
            },
          }).then((response) => {
            const { body, status } = response;
            expect(status).to.eq(403);
            expect(body).to.deep.eq(movieFixture.errorForbidden);
          });
        });
      });
    });
  });
});

describe("Consulta de filmes", () => {
  describe("Quando eu tenho filmes cadastrados", () => {
    it("Deve retornar uma lista de filmes", () => {
      cy.request("GET", "/movies").then((responseMovies) => {
        const { body, status } = responseMovies;
        expect(status).to.eq(200);
        expect(body).to.be.a("array");

        if (body.length > 0) {
          body.forEach((movie) => {
            expect(movie).to.have.all.keys(movieFixture.movie);
          });
        }
      });
    });
    it("Deve retornar um filme específico", () => {
      cy.adminLogin().then(() => {
        cy.createRandomMovie().then((randomMovie) => {
          cy.request({
            method: "POST",
            url: "/movies",
            body: randomMovie,
            headers: {
              Authorization: `Bearer ${Cypress.env("accessToken")}`,
            },
          }).then(() => {
            cy.request("GET", `/movies/search?title=${randomMovie.title}`).then(
              (responseMovie) => {
                const { body, status } = responseMovie;
                expect(status).to.eq(200);
                expect(body[0]).to.deep.include(randomMovie);
                expect(body[0]).to.have.all.keys(movieFixture.movie);
              }
            );
          });
        });
      });
    });
  });
});
