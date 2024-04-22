import { movieFixture } from "../fixtures/movieFixture";
import { userFixture } from "../fixtures/userFixture";

describe("Criação de usuários", () => {
  describe("Quando a criação de usuários é bem sucedida", () => {
    it("Deve criar um usuário", () => {
      cy.createRandomUser().then((randomUser) => {
        cy.request("POST", "/users", randomUser).then(({ body, status }) => {
          delete randomUser.password;

          expect(status).to.eq(201);
          expect(body.id).to.be.a("number");
          expect(body.type).to.eq(0);
          expect(body.active).to.be.true;

          expect(body).to.deep.include(randomUser);
        });
      });
    });
  });

  describe("Quando a criação de usuários falha", () => {
    let randomUser;
    beforeEach(() => {
      cy.createRandomUser().then((user) => {
        randomUser = user;
      });
    });

    it("Deve retornar erro 409 (Conflict) ao tentar criar um usuário com email já registrado", () => {
      cy.request("POST", "/users", randomUser).then(() => {
        cy.request({
          method: "POST",
          url: "/users",
          failOnStatusCode: false,
          body: randomUser,
        }).then(({ body, status }) => {
          expect(status).to.eq(409);
          expect(body).to.deep.eq(userFixture.errorAlreadyExists);
        });
      });
    });

    it("Deve retornar erro 400 (Bad Request) ao tentar criar um usuário com informações de email incorretas", () => {
      randomUser.email = "emailinvalido";

      cy.request({
        method: "POST",
        url: "/users",
        failOnStatusCode: false,
        body: randomUser,
      }).then(({ body, status }) => {
        expect(status).to.eq(400);
        expect(body).to.deep.eq(userFixture.errorEmailInvalid);
      });
    });

    it("Deve retornar erro 400 (Bad Request) ao tentar criar um usuário com senha menor que 6 caracteres", () => {
      randomUser.password = "123";

      cy.request({
        method: "POST",
        url: "/users",
        failOnStatusCode: false,
        body: randomUser,
      }).then(({ body, status }) => {
        expect(status).to.eq(400);
        expect(body).to.deep.eq(userFixture.errorPasswordTooShort);
      });
    });

    it("Deve retornar erro 400 (Bad Request) ao tentar criar um usuário com senha maior que 12 caracteres", () => {
      randomUser.password = "jey12345678910";

      cy.request({
        method: "POST",
        url: "/users",
        failOnStatusCode: false,
        body: randomUser,
      }).then(({ body, status }) => {
        expect(status).to.eq(400);
        expect(body).to.deep.eq(userFixture.errorPasswordTooLong);
      });
    });
  });
});

describe("Consulta de usuários", () => {
  describe("Quando a consulta  de usuários é bem sucedida", () => {
    beforeEach(() => {
      cy.adminLogin();
    });

    afterEach(() => {
      cy.deleteUser();
    });

    it("Deve consultar todos os usuários", () => {
      cy.request({
        method: "GET",
        url: "/users",
        headers: {
          Authorization: `Bearer ${Cypress.env("accessToken")}`,
        },
      }).then(({ body, status }) => {
        const users = body.slice(0, 10);
        const userType = Object.values(userFixture.user).map(
          (value) => typeof value
        );

        expect(status).to.eq(200);
        expect(body).to.be.an("array");

        users.forEach((user) => {
          Object.entries(userFixture.user).forEach(([key], i) => {
            expect(user[key]).to.be.a(userType[i]);
          });
        });
      });
    });

    it("Deve consultar um usuário específico", () => {
      const currentUser = Cypress.env("currentUser");

      cy.request({
        method: "GET",
        url: `/users/${currentUser.id}`,
        headers: {
          Authorization: `Bearer ${Cypress.env("accessToken")}`,
        },
      }).then(({ body, status }) => {
        expect(status).to.eq(200);
        expect(body).to.be.deep.eq(currentUser);
      });
    });
  });

  describe("Quando a consulta  de usuários falha", () => {
    it("Deve retornar erro 401 (Unauthorized) ao tentar consultar usuários sem autorização", () => {
      cy.request({
        method: "GET",
        url: "/users",
        failOnStatusCode: false,
      }).then(({ body, status }) => {
        expect(status).to.eq(401);
        expect(body).to.deep.eq(userFixture.errorUnauthorized);
      });
    });

    it("Deve retornar erro 403 (Forbidden) ao tentar consultar usuários sem ser administrador", () => {
      cy.userLogin()
        .then(() => {
          cy.request({
            method: "GET",
            url: "/users",
            failOnStatusCode: false,
            headers: {
              Authorization: `Bearer ${Cypress.env("accessToken")}`,
            },
          }).then(({ body, status }) => {
            expect(status).to.eq(403);
            expect(body).to.deep.eq(userFixture.errorForbidden);
          });
        })
        .then(() => {
          cy.deleteUser();
        });
    });
  });
});

describe("Criação de review pelo usuário", () => {
  describe("Quando a criação de review é bem sucedida", () => {
    it("Deve criar uma review", () => {
      cy.createAndFetchMovie()
        .then((movie) => {
          cy.request({
            method: "POST",
            url: "users/review",
            body: { ...movieFixture.review, movieId: movie.id },
            headers: {
              Authorization: `Bearer ${Cypress.env("accessToken")}`,
            },
          }).then(({ status, body }) => {
            expect(status).to.eq(201);
            expect(body).to.be.undefined;
          });
        })
        .then(() => {
          cy.deleteMovie().then(() => {
            cy.deleteUser();
          });
        });
    });
  });

  describe("Quando a criação de review falha", () => {
    beforeEach(() => {
      cy.adminLogin();
    });

    afterEach(() => {
      cy.deleteUser();
    });

    it("Deve retornar erro 400 (Bad Request) ao tentar criar uma review sem informar o movieId", () => {
      cy.request({
        method: "POST",
        url: "users/review",
        failOnStatusCode: false,
        body: movieFixture.review,
        headers: {
          Authorization: `Bearer ${Cypress.env("accessToken")}`,
        },
      }).then(({ body, status }) => {
        expect(status).to.eq(400);
        expect(body).to.deep.eq(userFixture.errorReviewMovieIdRequired);
      });
    });

    it("Deve retornar erro 404 (Not Found) ao tentar criar uma review para um filme inexistente", () => {
      cy.request({
        method: "POST",
        url: "users/review",
        failOnStatusCode: false,
        body: { ...movieFixture.review, movieId: 0 },
        headers: {
          Authorization: `Bearer ${Cypress.env("accessToken")}`,
        },
      }).then(({ body, status }) => {
        expect(status).to.eq(404);
        expect(body).to.deep.eq(movieFixture.errorMovieNotFound);
      });
    });
  });

  describe("Quando a criação de review falha", () => {
    let movie;

    beforeEach(() => {
      cy.createAndFetchMovie().then((randomMovie) => {
        movie = randomMovie;
      });
    });

    afterEach(() => {
      cy.deleteMovie().then(() => {
        cy.deleteUser();
      });
    });

    it("Deve retornar 400 (Bad Request) ao tentar criar uma review com score maior que 5", () => {
      cy.request({
        method: "POST",
        url: "users/review",
        failOnStatusCode: false,
        body: { ...movieFixture.review, movieId: movie.id, score: 6 },
        headers: {
          Authorization: `Bearer ${Cypress.env("accessToken")}`,
        },
      }).then(({ body, status }) => {
        expect(status).to.eq(400);
        expect(body).to.deep.eq(userFixture.errorReviewScoreInvalid);
      });
    });

    it("Deve retornar 400 (Bad Request) ao tentar criar uma review com score menor que 1", () => {
      cy.request({
        method: "POST",
        url: "users/review",
        failOnStatusCode: false,
        body: { ...movieFixture.review, movieId: movie.id, score: 0 },
        headers: {
          Authorization: `Bearer ${Cypress.env("accessToken")}`,
        },
      }).then(({ body, status }) => {
        expect(status).to.eq(400);
        expect(body).to.deep.eq(userFixture.errorReviewScoreInvalid);
      });
    });

    it("Deve retornar 400 (Bad Request) ao tentar criar uma review sem informar um texto de review como string", () => {
      cy.request({
        method: "POST",
        url: "users/review",
        failOnStatusCode: false,
        body: {
          ...movieFixture.review,
          movieId: movie.id,
          reviewText: null,
        },
        headers: {
          Authorization: `Bearer ${Cypress.env("accessToken")}`,
        },
      }).then(({ body, status }) => {
        expect(status).to.eq(400);
        expect(body).to.deep.eq(userFixture.errorReviewTextStringRequired);
      });
    });

    it("Deve retornar erro 401 (Unauthorized) ao tentar criar uma review sem autorização", () => {
      cy.request({
        method: "POST",
        url: "users/review",
        failOnStatusCode: false,
        body: movieFixture.review,
      }).then(({ body, status }) => {
        expect(status).to.eq(401);
        expect(body).to.deep.eq(userFixture.errorUnauthorized);
      });
    });
  });
});

describe("Consulta de review feita pelo usuario", () => {
  describe("Quando a consulta é bem sucedida", () => {
    it("Deve consultar todas as reviews feitas pelo usuário", () => {
      let movieId;
      let movieTitle;
      cy.createReview()
        .then((responseMovie) => {
          movieId = responseMovie.body.id;
          movieTitle = responseMovie.body.title;

          cy.request({
            method: "GET",
            url: "/users/review/all",
            headers: {
              Authorization: `Bearer ${Cypress.env("accessToken")}`,
            },
          }).then(({ body, status }) => {
            const review = body[0];

            expect(status).to.eq(200);
            expect(body).to.be.an("array");
            expect(review.reviewType).to.be.a("number");
            expect(review.id).to.be.a("number");
            expect(review).to.deep.include({
              ...movieFixture.review,
              movieId,
              movieTitle,
            });
          });
        })
        .then(() => {
          cy.deleteUser();
        });
    });
  });
});

describe("Inativação de usuários", () => {
  describe("Quando a inativação é bem sucedida", () => {
    it("Deve inativar um usuário", () => {
      cy.adminLogin().then(() => {
        cy.request({
          method: "PATCH",
          url: "/users/inactivate",
          headers: {
            Authorization: `Bearer ${Cypress.env("accessToken")}`,
          },
        }).then(({ body }) => {
          expect(body).to.be.empty;
        });
      });
    });
  });
});
