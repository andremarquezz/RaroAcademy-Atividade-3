import { mockUser } from "../fixtures/mockUser";

describe("Criação de usuario", () => {
  describe("Caso de sucesso", () => {
    it("Deve criar um usuário com sucesso e retornar status 201 e o corpo deve conter as informações esperadas.", () => {
      cy.createRandomUser().then((randomUser) => {
        cy.request("POST", "/users", randomUser).then((responseUserCreated) => {
          const { body, status } = responseUserCreated;

          expect(status).to.eq(201);
          expect(body.id).to.be.a("number");
          expect(body).to.have.all.keys(mockUser.defaultUserData);
        });
      });
    });
  });
});

describe("Consulta de usuario", () => {
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
              expect(user).to.have.all.keys(mockUser.defaultUserData);
            });
          });
      });
    });
  });
});
