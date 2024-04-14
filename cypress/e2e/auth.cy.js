import { authFixture } from "../fixtures/authFixture";

describe("Validação da Autenticação", () => {
  describe("Quando a autenticação é bem sucedida", () => {
    it("Deve retornar um token de acesso", () => {
      cy.createRandomUser().then((randomUser) => {
        cy.request("POST", "/users", randomUser).then(() => {
          cy.request("POST", "/auth/login", {
            email: randomUser.email,
            password: randomUser.password,
          }).then((responseAuth) => {
            const { body, status } = responseAuth;
            expect(status).to.eq(200);
            expect(body).to.have.property("accessToken");
            expect(body.accessToken).to.be.a("string");
          });
        });
      });
    });
  });
  describe("Quando a autenticação falha", () => {
    it("Deve retornar erro 400 (Bad Request) ao tentar autenticar com email incorreto", () => {
      cy.createRandomUser().then((randomUser) => {
        cy.request("POST", "/users", randomUser).then(() => {
          cy.request({
            method: "POST",
            url: "/auth/login",
            failOnStatusCode: false,
            body: {
              email: "emailinvalido",
              password: randomUser.password,
            },
          }).then((response) => {
            const { body, status } = response;
            expect(status).to.eq(400);
            expect(body).to.deep.eq(authFixture.errorEmailInvalid);
          });
        });
      });
    });
    it("Deve retornar erro 401 (Unauthorized) ao tentar autenticar com a senha incorreta", () => {
      cy.createRandomUser().then((randomUser) => {
        cy.request("POST", "/users", randomUser).then(() => {
          cy.request({
            method: "POST",
            url: "/auth/login",
            failOnStatusCode: false,
            body: {
              email: randomUser.email,
              password: "ruimDeinvadirk",
            },
          }).then((response) => {
            const { body, status } = response;
            expect(status).to.eq(401);
            expect(body).to.deep.eq(authFixture.errorUnauthorized);
          });
        });
      });
    });
  });
});
