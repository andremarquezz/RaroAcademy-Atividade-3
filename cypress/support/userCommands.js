import { faker } from "@faker-js/faker";
Cypress.Commands.add("createRandomUser", () => {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: "123456",
  };
});

Cypress.Commands.add("userLogin", () => {
  cy.createRandomUser().then((randomUser) => {
    cy.request("POST", "/users", randomUser)
      .then((userCreated) => {
        Cypress.env("currentUser", userCreated.body);

        cy.request("POST", `/auth/login`, {
          email: randomUser.email,
          password: randomUser.password,
        });
      })
      .then((userLogged) => {
        const { accessToken } = userLogged.body;
        Cypress.env("accessToken", accessToken);
      });
  });
});

Cypress.Commands.add("adminLogin", () => {
  cy.createRandomUser().then((randomUser) => {
    cy.request("POST", "/users", randomUser)
      .then((userCreated) => {
        userCreated.body.type = 1;
        Cypress.env("currentUser", userCreated.body);

        cy.request("POST", `/auth/login`, {
          email: randomUser.email,
          password: randomUser.password,
        });
      })
      .then((userLogged) => {
        const { accessToken } = userLogged.body;
        Cypress.env("accessToken", accessToken);
      })
      .then(() => {
        cy.request({
          method: "PATCH",
          url: "/users/admin",
          headers: {
            Authorization: `Bearer ${Cypress.env("accessToken")}`,
          },
        });
      });
  });
});
