import { userFixture } from "../fixtures/userFixture";

describe("Criação de usuários", () => {
  describe("Quando a criação é bem sucedida", () => {
    it("Deve criar um usuário com sucesso", () => {
      cy.createRandomUser().then((randomUser) => {
        cy.request("POST", "/users", randomUser).then((responseUserCreated) => {
          const { body, status } = responseUserCreated;
          delete randomUser.password;

          expect(status).to.eq(201);
          expect(body).to.deep.include(randomUser);
          expect(body).to.have.property("id");
          expect(body.id).to.be.a("number");
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
  });
});

describe("Consulta de usuários", () => {
  describe("Quando a consulta é bem sucedida", () => {
    it("Deve consultar todos os usuários com sucesso", () => {
      cy.login().then(() => {
        cy.request({
          method: "GET",
          url: "/users",
          headers: {
            Authorization: `Bearer ${Cypress.env("accessToken")}`,
          },
        }).then((response) => {
          const { body, status } = response;
          expect(status).to.eq(200);
          expect(body).to.be.an("array");
        });
      });
    });

    it("Deve consultar um usuário específico com sucesso", () => {
      const userLogged = Cypress.env("userLogged");
      cy.login()
        .then(() => {
          cy.request({
            method: "GET",
            url: `/users/${userLogged.id}`,
            headers: {
              Authorization: `Bearer ${Cypress.env("accessToken")}`,
            },
          });
        })
        .then((userById) => {
          const { body, status } = userById;
          expect(status).to.eq(200);
          expect(body).to.be.deep.eq(userLogged);
        });
    });
  });
});
