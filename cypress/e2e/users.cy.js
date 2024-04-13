import { userMock } from "../fixtures/userMock";

describe("Criação de usuario", () => {
  describe("Quando a criação é bem sucedida", () => {
    it("Deve criar um usuário com sucesso", () => {
      cy.createRandomUser().then((randomUser) => {
        cy.request("POST", "/users", randomUser).then((responseUserCreated) => {
          const { body, status } = responseUserCreated;

          expect(status).to.eq(201);
          expect(body.id).to.be.a("number");
          expect(body).to.have.all.keys(userMock.defaultUserData);
        });
      });
    });
  });

  describe("Quando a criação falha", () => {
    it("Deve retornar erro 409(Conflict) ao tentar criar um usuário com email já registrado", () => {
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
            expect(body).to.deep.eq(userMock.errorUserAlreadyExistsResponse);
          });
        });
      });
    });
  });
});

describe.skip("Consulta de usuario", () => {
  describe("Caso de sucesso", () => {
    it("Deve consultar todos os usuários com sucesso e retornar status 200 e o corpo deve conter uma lista de usuários.", () => {
      cy.createRandomUser().then((randomUser) => {
        cy.request("POST", "/users", randomUser)
          .then(() => {
            cy.request("POST", `/auth/login`, {
              email: randomUser.email,
              password: randomUser.password,
            });
          })
          .then((userLogged) => {
            const { accessToken } = userLogged.body;
            Cypress.env("accessToken", accessToken);

            cy.request({
              method: "PATCH",
              url: "/users/admin",
              headers: {
                Authorization: `Bearer ${Cypress.env("accessToken")}`,
              },
            });
          })
          .then(() => {
            cy.request({
              method: "GET",
              url: "/users",
              headers: {
                Authorization: `Bearer ${Cypress.env("accessToken")}`,
              },
            });
          })
          .then((listAllUser) => {
            const { body, status } = listAllUser;
            expect(status).to.eq(200);
            expect(body).to.be.an("array");
            body.forEach((user) => {
              expect(user).to.have.all.keys(userMock.defaultUserData);
            });
          });
      });
    });
  });
});
