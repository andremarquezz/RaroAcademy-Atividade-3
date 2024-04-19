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
    it("Deve retornar erro 400 (Bad Request) ao tentar criar um filme com informação de título incorreta", () => {
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
    it("Deve retornar erro 400 (Bad Request) ao tentar criar um filme com informação de gênero incorreta", () => {
      cy.adminLogin().then(() => {
        cy.createRandomMovie().then((randomMovie) => {
          randomMovie.genre = "";
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
            expect(body).to.deep.eq(movieFixture.errorGenreInvalid);
          });
        });
      });
    });
    it("Deve retornar erro 400 (Bad Request) ao tentar criar um filme com informação de descrição incorreta", () => {
      cy.adminLogin().then(() => {
        cy.createRandomMovie().then((randomMovie) => {
          randomMovie.description = "";
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
            expect(body).to.deep.eq(movieFixture.errorDescriptionInvalid);
          });
        });
      });
    });

    it("Deve retornar erro 400 (Bad Request) ao tentar criar um filme com duração em minutos como string", () => {
      cy.adminLogin().then(() => {
        cy.createRandomMovie().then((randomMovie) => {
          randomMovie.durationInMinutes = "";
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
            expect(body).to.deep.eq(movieFixture.errorDurationInvalid);
          });
        });
      });
    });

    it("Deve retornar erro 400 (Bad Request) ao tentar criar um filme com ano de lançamento como string", () => {
      cy.adminLogin().then(() => {
        cy.createRandomMovie().then((randomMovie) => {
          randomMovie.releaseYear = "";
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
            expect(body).to.deep.eq(movieFixture.errorReleaseYearInvalid);
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
  describe("Quando a consulta é bem sucedida", () => {
    it("Deve retornar uma lista de filmes", () => {
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
            cy.request("GET", "/movies").then((responseMovies) => {
              const { body, status } = responseMovies;
              const movies = body.slice(0, 20);
              const expectedType = Object.values(movieFixture.movie).map(
                (value) => typeof value
              );

              expect(status).to.eq(200);
              expect(body).to.be.a("array");
              movies.forEach((movie) => {
                expect(movie).to.have.property("totalRating");
              });

              movies.forEach((movie) => {
                delete movie.totalRating;
                Object.entries(movieFixture.movie).forEach(([key], i) => {
                  expect(movie[key]).to.be.a(expectedType[i]);
                });
              });
            });
          });
        });
      });
    });
    it("Deve retornar um filme específico pela consulta por titulo", () => {
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
                const movie = body[0];

                const expectedType = Object.values(movieFixture.movie).map(
                  (value) => (value === null ? "null" : typeof value)
                );

                expect(status).to.eq(200);
                expect(movie).to.deep.include(randomMovie);

                Object.entries(movieFixture.movie).forEach(([key], i) => {
                  expect(movie[key]).to.be.a(expectedType[i]);
                });
              }
            );
          });
        });
      });
    });
    it("Deve retornar um filme especifico pela consulta por id", () => {
      cy.createAndFetchMovie().then((movie) => {
        cy.request("GET", `/movies/${movie.id}`).then((responseMovieById) => {
          const { body, status } = responseMovieById;
          delete movie.totalRating;

          expect(status).to.eq(200);
          expect(body).to.deep.include(movie);
          expect(body.reviews).to.be.an("array");
          expect(body.criticScore).to.be.a("number");
          expect(body.audienceScore).to.be.a("number");
        });
      });
    });
  });
  describe("Quando a consulta falha", () => {
    it("Deve retornar um corpo vazio quando não encontrar o filme pelo id", () => {
      cy.request("GET", "/movies/5645646").then((responseMovieById) => {
        const { body, status } = responseMovieById;

        expect(status).to.eq(200);
        expect(body).to.be.string;
        expect(body).to.eq("");
      });
    });
    it("Deve retornar um corpo vazio quando não encontra o filme pelo titulo", () => {
      cy.request("GET", "movies/search?title=yujfhdgjfgjfgjhfgj").then(
        (responseMovieById) => {
          const { body, status } = responseMovieById;

          expect(status).to.eq(200);
          expect(body).to.be.empty;
        }
      );
    });
  });
});
describe("Atualização de filmes", () => {
  describe("Quando a atualização é bem sucedida", () => {
    it("Deve atualizar um filme", () => {
      cy.createAndFetchMovie().then((movie) => {
        const newMovie = {
          ...movie,
          title: "Novo titulo",
          genre: "Novo genero",
          description: "Nova descrição",
        };

        cy.request({
          method: "PUT",
          url: `/movies/${movie.id}`,
          body: newMovie,
          headers: {
            Authorization: `Bearer ${Cypress.env("accessToken")}`,
          },
        }).then((responseMovieUpdated) => {
          const { body, status } = responseMovieUpdated;
          expect(status).to.eq(204);
          expect(body).to.be.undefined;
        });
      });
    });
  });
  describe("Quando a atualização falha", () => {
    it("Deve retornar erro 400 (Bad Request) ao tentar atualizar um filme com informação de título incorreta", () => {
      cy.createAndFetchMovie().then((movie) => {
        const newMovie = {
          ...movie,
          title: "",
        };

        cy.request({
          method: "PUT",
          url: `/movies/${movie.id}`,
          body: newMovie,
          failOnStatusCode: false,
          headers: {
            Authorization: `Bearer ${Cypress.env("accessToken")}`,
          },
        }).then((response) => {
          const { body, status } = response;
          expect(status).to.eq(400);
          expect(body).to.deep.eq(movieFixture.errorUpdateTitleInvalid);
        });
      });
    });
    it("Deve retornar erro 404 (Not Found) ao tentar atualizar um filme que não existe", () => {
      cy.createRandomMovie().then((randomMovie) => {
        cy.request({
          method: "PUT",
          url: "/movies/5645646",
          body: randomMovie,
          failOnStatusCode: false,
          headers: {
            Authorization: `Bearer ${Cypress.env("accessToken")}`,
          },
        }).then((response) => {
          const { body, status } = response;
          expect(status).to.eq(404);
          expect(body).to.deep.eq(movieFixture.errorMovieNotFound);
        });
      });
    });
  });
});
