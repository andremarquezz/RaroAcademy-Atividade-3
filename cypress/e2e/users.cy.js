describe("Criação e consultas de usuarios na API Raro", () => {
  describe("Casos de sucesso", () => {
    it("Deve criar um usuário com sucesso e retornar status 201 e o corpo com as informações esperadas.", () => {
      cy.task("createRandomUser").then((randomUser) => {
        cy.request("POST", "/users", randomUser).then((responseUserCreated) => {
          const { body, status } = responseUserCreated;

          expect(status).to.eq(201);
          expect(body.id).to.be.a("number");

          cy.fixture("mockUser.json").then((expectedUserCreated) => {
            expect(body).to.have.all.keys(expectedUserCreated);
          });
        });
      });
    });

    it("Deve consultar todos os usuários com sucesso e retornar status 200 e uma lista de usuários.", () => {
      cy.task("createRandomUser").then((randomUser) => {
        cy.request("POST", "/users", randomUser)
          .then(() => {
            return cy.request("POST", `/auth/login`, {
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
          });
      });
    });
  });
});
