import { movieFixture } from "../fixtures/movieFixture";
import { isWithinOneMinuteDifference } from "../support/utils/movieUtils";

describe("Cadastro de filmes", () => {
  describe("Quando o cadastro de filmes é bem sucedido", () => {
    it("Deve criar um filme", () => {
      let idMovie;
      cy.adminLogin().then(() => {
        cy.createRandomMovie().then((randomMovie) => {
          cy.request({
            method: "POST",
            url: "/movies",
            body: randomMovie,
            headers: {
              Authorization: `Bearer ${Cypress.env("accessToken")}`,
            },
          })
            .then(({ body, status }) => {
              idMovie = body.id;
              expect(status).to.eq(201);
              expect(body).to.deep.include(randomMovie);
            })
            .then(() => {
              cy.deleteMovie(idMovie).then(() => {
                cy.deleteUser();
              });
            });
        });
      });
    });
  });

  describe("Quando o cadastro de filmes falha", () => {
    let randomMovie;

    beforeEach(() => {
      cy.adminLogin().then(() => {
        cy.createRandomMovie().then((movie) => {
          randomMovie = movie;
        });
      });
    });

    afterEach(() => {
      cy.deleteUser();
    });

    it("Deve retornar erro 400 (Bad Request) ao tentar criar um filme com informação de título incorreta", () => {
      randomMovie.title = "";
      cy.request({
        method: "POST",
        url: "/movies",
        failOnStatusCode: false,
        body: randomMovie,
        headers: {
          Authorization: `Bearer ${Cypress.env("accessToken")}`,
        },
      }).then(({ body, status }) => {
        expect(status).to.eq(400);
        expect(body).to.deep.eq(movieFixture.errorTitleInvalid);
      });
    });

    it("Deve retornar erro 400 (Bad Request) ao tentar criar um filme com informação de gênero incorreta", () => {
      randomMovie.genre = "";
      cy.request({
        method: "POST",
        url: "/movies",
        failOnStatusCode: false,
        body: randomMovie,
        headers: {
          Authorization: `Bearer ${Cypress.env("accessToken")}`,
        },
      }).then(({ body, status }) => {
        expect(status).to.eq(400);
        expect(body).to.deep.eq(movieFixture.errorGenreInvalid);
      });
    });

    it("Deve retornar erro 400 (Bad Request) ao tentar criar um filme com informação de descrição incorreta", () => {
      randomMovie.description = "";
      cy.request({
        method: "POST",
        url: "/movies",
        failOnStatusCode: false,
        body: randomMovie,
        headers: {
          Authorization: `Bearer ${Cypress.env("accessToken")}`,
        },
      }).then(({ body, status }) => {
        expect(status).to.eq(400);
        expect(body).to.deep.eq(movieFixture.errorDescriptionInvalid);
      });
    });

    it("Deve retornar erro 400 (Bad Request) ao tentar criar um filme com duração em minutos como string", () => {
      randomMovie.durationInMinutes = "";
      cy.request({
        method: "POST",
        url: "/movies",
        failOnStatusCode: false,
        body: randomMovie,
        headers: {
          Authorization: `Bearer ${Cypress.env("accessToken")}`,
        },
      }).then(({ body, status }) => {
        expect(status).to.eq(400);
        expect(body).to.deep.eq(movieFixture.errorDurationInvalid);
      });
    });

    it("Deve retornar erro 400 (Bad Request) ao tentar criar um filme com ano de lançamento como string", () => {
      randomMovie.releaseYear = "";
      cy.request({
        method: "POST",
        url: "/movies",
        failOnStatusCode: false,
        body: randomMovie,
        headers: {
          Authorization: `Bearer ${Cypress.env("accessToken")}`,
        },
      }).then(({ body, status }) => {
        expect(status).to.eq(400);
        expect(body).to.deep.eq(movieFixture.errorReleaseYearInvalid);
      });
    });

    it("Deve retornar erro 401 (Unauthorized) ao tentar criar um filme sem estar autenticado", () => {
      cy.request({
        method: "POST",
        url: "/movies",
        failOnStatusCode: false,
        body: randomMovie,
      }).then(({ body, status }) => {
        expect(status).to.eq(401);
        expect(body).to.deep.eq(movieFixture.errorUnauthorized);
      });
    });
  });

  describe("Quando o cadastro de filmes  falha", () => {
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
          })
            .then(({ body, status }) => {
              expect(status).to.eq(403);
              expect(body).to.deep.eq(movieFixture.errorForbidden);
            })
            .then(() => {
              cy.deleteUser();
            });
        });
      });
    });
  });
});

describe("Consulta de filmes", () => {
  describe("Quando a consulta de filmes é bem sucedida", () => {
    let randomMovie;

    beforeEach(() => {
      cy.adminLogin().then(() => {
        cy.createRandomMovie().then((movie) => {
          randomMovie = movie;
        });
      });
    });

    it("Deve retornar uma lista de filmes", () => {
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
          const movies = body.slice(0, 10);
          const movieType = Object.values(movieFixture.movie).map(
            (value) => typeof value
          );

          expect(status).to.eq(200);
          expect(body).to.be.an("array");

          movies.forEach((movie) => {
            expect(movie).to.have.property("totalRating");
          });

          movies.forEach((movie) => {
            delete movie.totalRating;
            Object.entries(movieFixture.movie).forEach(([key], i) => {
              expect(movie[key]).to.be.a(movieType[i]);
            });
          });
        });
      });
    });

    it("Deve retornar um filme específico pela consulta por titulo", () => {
      let idMovie;

      cy.request({
        method: "POST",
        url: "/movies",
        body: randomMovie,
        headers: {
          Authorization: `Bearer ${Cypress.env("accessToken")}`,
        },
      })
        .then(() => {
          cy.request("GET", `/movies/search?title=${randomMovie.title}`).then(
            ({ body, status }) => {
              const movieBody = body[0];
              idMovie = body[0].id;

              const movieType = Object.values(movieFixture.movie).map((value) =>
                value === null ? "null" : typeof value
              );

              expect(status).to.eq(200);
              expect(body).to.be.an("array");
              expect(movieBody).to.deep.include(randomMovie);

              Object.entries(movieFixture.movie).forEach(([key], i) => {
                expect(movieBody[key]).to.be.a(movieType[i]);
              });
            }
          );
        })
        .then(() => {
          cy.deleteMovie(idMovie).then(() => {
            cy.deleteUser();
          });
        });
    });

    it("Deve retornar um filme especifico pela consulta por id", () => {
      let idMovie;

      cy.createAndFetchMovie().then((movie) => {
        idMovie = movie.id;

        cy.request("GET", `/movies/${movie.id}`)
          .then(({ body, status }) => {
            delete movie.totalRating;

            expect(status).to.eq(200);
            expect(body).to.deep.include(movie);
            expect(body.reviews).to.be.an("array");
            expect(body.criticScore).to.be.a("number");
            expect(body.audienceScore).to.be.a("number");
          })
          .then(() => {
            cy.deleteMovie(idMovie).then(() => {
              cy.deleteUser();
            });
          });
      });
    });

    it("Deve retornar a review de um filme feita por um usuário", () => {
      let idMovie;
      cy.createReview()
        .then((movie) => {
          idMovie = movie.id;

          const {
            body: { reviews, audienceScore },
            status,
          } = movie;
          const user = {
            id: Cypress.env("currentUser").id,
            name: Cypress.env("currentUser").name,
            type: Cypress.env("currentUser").type,
          };
          const review = reviews[0];
          const reviewUpdatedAt = reviews[0].updatedAt;

          const isWithinOneMinute =
            isWithinOneMinuteDifference(reviewUpdatedAt);

          expect(status).to.eq(200);
          expect(reviews).to.be.an("array");
          expect(isWithinOneMinute).to.be.true;
          expect(review).to.deep.include(movieFixture.review);
          expect(review.user).to.deep.eq(user);
          expect(review.score).to.be.eq(5);
          expect(audienceScore).to.be.eq(5);
          expect(review.reviewType).to.be.a("number");
        })
        .then(() => {
          cy.deleteMovie(idMovie).then(() => {
            cy.deleteUser();
          });
        });
    });
  });

  describe("Quando a consulta de filmes falha", () => {
    it("Deve retornar um corpo vazio quando não encontrar o filme pelo id", () => {
      cy.request("GET", "/movies/5645646").then(({ body, status }) => {
        expect(status).to.eq(200);
        expect(body).to.be.string;
        expect(body).to.be.empty;
      });
    });
    it("Deve retornar um corpo vazio quando não encontra o filme pelo titulo", () => {
      cy.request("GET", "movies/search?title=yujfhdgjfgjfgjhfgj").then(
        ({ body, status }) => {
          expect(status).to.eq(200);
          expect(body).to.be.empty;
        }
      );
    });
  });
});

describe("Atualização de filmes", () => {
  describe("Quando a atualização de filmes é bem sucedida", () => {
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
        })
          .then(({ body, status }) => {
            expect(status).to.eq(204);
            expect(body).to.be.undefined;
          })
          .then(() => {
            cy.deleteMovie().then(() => {
              cy.deleteUser();
            });
          });
      });
    });
  });

  describe("Quando a atualização de filmes falha", () => {
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
        })
          .then(({ body, status }) => {
            expect(status).to.eq(400);
            expect(body).to.deep.eq(movieFixture.errorUpdateTitleInvalid);
          })
          .then(() => {
            cy.deleteMovie().then(() => {
              cy.deleteUser();
            });
          });
      });
    });
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
        })
          .then(({ body, status }) => {
            expect(status).to.eq(400);
            expect(body).to.deep.eq(movieFixture.errorUpdateTitleInvalid);
          })
          .then(() => {
            cy.deleteMovie().then(() => {
              cy.deleteUser();
            });
          });
      });
    });

    it("Deve retornar erro 404 (Not Found) ao tentar atualizar um filme que não existe", () => {
      cy.adminLogin().then(() => {
        cy.createRandomMovie().then((randomMovie) => {
          cy.request({
            method: "PUT",
            url: "/movies/5645646",
            body: randomMovie,
            failOnStatusCode: false,
            headers: {
              Authorization: `Bearer ${Cypress.env("accessToken")}`,
            },
          })
            .then(({ body, status }) => {
              expect(status).to.eq(404);
              expect(body).to.deep.eq(movieFixture.errorMovieNotFound);
            })
            .then(() => {
              cy.deleteUser();
            });
        });
      });
    });
  });
});
