import { movieFixture } from "../fixtures/movieFixture";
import { userFixture } from "../fixtures/userFixture";

describe("Criação de usuários", () => {
  describe("Quando a criação é bem sucedida", () => {
    it("Deve criar um usuário", () => {
      cy.createRandomUser().then((randomUser) => {
        cy.request("POST", "/users", randomUser).then((responseUserCreated) => {
          const { body, status } = responseUserCreated;
          delete randomUser.password;

          expect(status).to.eq(201);
          expect(body).to.deep.include(randomUser);
          expect(body.id).to.be.a("number");
          expect(body.type).to.eq(0);
          expect(body.active).to.be.true;
        });
      });
    });
  });

  describe("Quando a criação falha", () => {
    it("Deve retornar erro 409 (Conflict) ao tentar criar um usuário com email já registrado", () => {
      cy.createRandomUser().then((randomUser) => {
        cy.request("POST", "/users", randomUser).then(() => {
          cy.request({
            method: "POST",
            url: "/users",
            failOnStatusCode: false,
            body: randomUser,
          }).then((response) => {
            const { body, status } = response;

            expect(status).to.eq(409);
            expect(body).to.deep.eq(userFixture.errorAlreadyExists);
          });
        });
      });
    });

    it("Deve retornar erro 400 (Bad Request) ao tentar criar um usuário com informações de email incorretas", () => {
      cy.createRandomUser().then((randomUser) => {
        randomUser.email = "emailinvalido";

        cy.request({
          method: "POST",
          url: "/users",
          failOnStatusCode: false,
          body: randomUser,
        }).then((response) => {
          const { body, status } = response;

          expect(status).to.eq(400);
          expect(body).to.deep.eq(userFixture.errorEmailInvalid);
        });
      });
    });
    it("Deve retornar erro 400 (Bad Request) ao tentar criar um usuário com senha menor que 6 caracteres", () => {
      cy.createRandomUser().then((randomUser) => {
        randomUser.password = "123";

        cy.request({
          method: "POST",
          url: "/users",
          failOnStatusCode: false,
          body: randomUser,
        }).then((response) => {
          const { body, status } = response;

          expect(status).to.eq(400);
          expect(body).to.deep.eq(userFixture.errorPasswordTooShort);
        });
      });
    });
    it("Deve retornar erro 400 (Bad Request) ao tentar criar um usuário com senha maior que 12 caracteres", () => {
      cy.createRandomUser().then((randomUser) => {
        randomUser.password = "jey12345678910";

        cy.request({
          method: "POST",
          url: "/users",
          failOnStatusCode: false,
          body: randomUser,
        }).then((response) => {
          const { body, status } = response;

          expect(status).to.eq(400);
          expect(body).to.deep.eq(userFixture.errorPasswordTooLong);
        });
      });
    });
  });
});

describe("Consulta de usuários", () => {
  describe("Quando a consulta é bem sucedida", () => {
    it("Deve consultar todos os usuários", () => {
      cy.adminLogin().then(() => {
        cy.request({
          method: "GET",
          url: "/users",
          headers: {
            Authorization: `Bearer ${Cypress.env("accessToken")}`,
          },
        }).then((response) => {
          const { body, status } = response;
          const users = body.slice(0, 20);
          const expectedType = Object.values(userFixture.user).map(
            (value) => typeof value
          );
          expect(status).to.eq(200);
          expect(body).to.be.an("array");

          users.forEach((user) => {
            Object.entries(userFixture.user).forEach(([key], i) => {
              expect(user[key]).to.be.a(expectedType[i]);
            });
          });
        });
      });
    });

    it("Deve consultar um usuário específico", () => {
      const currentUser = Cypress.env("currentUser");
      cy.adminLogin()
        .then(() => {
          cy.request({
            method: "GET",
            url: `/users/${currentUser.id}`,
            headers: {
              Authorization: `Bearer ${Cypress.env("accessToken")}`,
            },
          });
        })
        .then((userById) => {
          const { body, status } = userById;
          expect(status).to.eq(200);
          expect(body).to.be.deep.eq(currentUser);
        });
    });
  });
  describe("Quando a consulta falha", () => {
    it("Deve retornar erro 401 (Unauthorized) ao tentar consultar usuários sem autorização", () => {
      cy.request({
        method: "GET",
        url: "/users",
        failOnStatusCode: false,
      }).then((response) => {
        const { body, status } = response;
        expect(status).to.eq(401);
        expect(body).to.deep.eq(userFixture.errorUnauthorized);
      });
    });
    it("Deve retornar erro 403 (Forbidden) ao tentar consultar usuários sem ser administrador", () => {
      cy.userLogin().then(() => {
        cy.request({
          method: "GET",
          url: "/users",
          failOnStatusCode: false,
          headers: {
            Authorization: `Bearer ${Cypress.env("accessToken")}`,
          },
        }).then((response) => {
          const { body, status } = response;
          expect(status).to.eq(403);
          expect(body).to.deep.eq(userFixture.errorForbidden);
        });
      });
    });
  });
});

describe("Criação de review pelo usuário", () => {
  describe("Quando a criação é bem sucedida", () => {
    it("Deve criar uma review", () => {
      cy.createAndFetchMovie().then((movie) => {
        cy.request({
          method: "POST",
          url: "users/review",
          body: { ...movieFixture.review, movieId: movie.id },
          headers: {
            Authorization: `Bearer ${Cypress.env("accessToken")}`,
          },
        }).then((responseReviewCreated) => {
          expect(responseReviewCreated.status).to.eq(201);
          expect(responseReviewCreated.body).to.be.undefined;
        });
      });
    });
  });
  describe("Quando a criação falha", () => {
    it("Deve retornar erro 400 (Bad Request) ao tentar criar uma review sem informar o movieId", () => {
      cy.adminLogin().then(() => {
        cy.request({
          method: "POST",
          url: "users/review",
          failOnStatusCode: false,
          body: movieFixture.review,
          headers: {
            Authorization: `Bearer ${Cypress.env("accessToken")}`,
          },
        }).then((response) => {
          const { body, status } = response;
          expect(status).to.eq(400);
          expect(body).to.deep.eq(userFixture.errorReviewMovieIdRequired);
        });
      });
    });
    it("Deve retornar erro 401 (Unauthorized) ao tentar criar uma review sem autorização", () => {
      cy.request({
        method: "POST",
        url: "users/review",
        failOnStatusCode: false,
        body: movieFixture.review,
      }).then((response) => {
        const { body, status } = response;
        expect(status).to.eq(401);
        expect(body).to.deep.eq(userFixture.errorUnauthorized);
      });
    });
    it("Deve retornar erro 404 (Not Found) ao tentar criar uma review para um filme inexistente", () => {
      cy.adminLogin().then(() => {
        cy.request({
          method: "POST",
          url: "users/review",
          failOnStatusCode: false,
          body: { ...movieFixture.review, movieId: 0 },
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
    it("Deve retornar 400 (Bad Request) ao tentar criar uma review com score maior que 5", () => {
      cy.createAndFetchMovie().then((movie) => {
        cy.request({
          method: "POST",
          url: "users/review",
          failOnStatusCode: false,
          body: { ...movieFixture.review, movieId: movie.id, score: 6 },
          headers: {
            Authorization: `Bearer ${Cypress.env("accessToken")}`,
          },
        }).then((response) => {
          const { body, status } = response;
          expect(status).to.eq(400);
          expect(body).to.deep.eq(userFixture.errorReviewScoreInvalid);
        });
      });
    });
    it("Deve retornar 400 (Bad Request) ao tentar criar uma review com score menor que 1", () => {
      cy.createAndFetchMovie().then((movie) => {
        cy.request({
          method: "POST",
          url: "users/review",
          failOnStatusCode: false,
          body: { ...movieFixture.review, movieId: movie.id, score: 0 },
          headers: {
            Authorization: `Bearer ${Cypress.env("accessToken")}`,
          },
        }).then((response) => {
          const { body, status } = response;
          expect(status).to.eq(400);
          expect(body).to.deep.eq(userFixture.errorReviewScoreInvalid);
        });
      });
    });
    it("Deve retornar 400 (Bad Request) ao tentar criar uma review sem informar um texto de review como string", () => {
      cy.createAndFetchMovie().then((movie) => {
        cy.request({
          method: "POST",
          url: "users/review",
          failOnStatusCode: false,
          body: { ...movieFixture.review, movieId: movie.id, reviewText: null },
          headers: {
            Authorization: `Bearer ${Cypress.env("accessToken")}`,
          },
        }).then((response) => {
          const { body, status } = response;
          expect(status).to.eq(400);
          expect(body).to.deep.eq(userFixture.errorReviewTextStringRequired);
        });
      });
    });
  });
});

describe("Consulta de review feita pelo usuario", () => {
  describe("Quando a consulta é bem sucedida", () => {
    it("Deve consultar todas as reviews feitas pelo usuário", () => {
      let movieId;
      let movieTitle;
      cy.createReview().then((responseMovie) => {
        movieId = responseMovie.body.id;
        movieTitle = responseMovie.body.title;

        cy.request({
          method: "GET",
          url: "/users/review/all",
          headers: {
            Authorization: `Bearer ${Cypress.env("accessToken")}`,
          },
        }).then((response) => {
          const { body, status } = response;
          expect(status).to.eq(200);
          expect(body).to.be.an("array"); // redundante???
          expect(body[0].reviewType).to.be.a("number");
          expect(body[0].id).to.be.a("number");
          expect(body[0]).to.deep.include({
            ...movieFixture.review,
            movieId,
            movieTitle,
          });
        });
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
        }).then((response) => {
          expect(response.body).to.be.empty;
        });
      });
    });
  });
});
