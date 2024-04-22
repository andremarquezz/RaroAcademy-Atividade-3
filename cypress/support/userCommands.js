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
      .then(({ body }) => {
        Cypress.env("currentUser", body);

        cy.request("POST", `/auth/login`, {
          email: randomUser.email,
          password: randomUser.password,
        });
      })
      .then(({ body }) => {
        Cypress.env("accessToken", body.accessToken);
      });
  });
});

Cypress.Commands.add("adminLogin", () => {
  cy.createRandomUser().then((randomUser) => {
    cy.request("POST", "/users", randomUser)
      .then(({ body }) => {
        body.type = 1;
        Cypress.env("currentUser", body);

        cy.request("POST", `/auth/login`, {
          email: randomUser.email,
          password: randomUser.password,
        });
      })
      .then(({ body }) => {
        Cypress.env("accessToken", body.accessToken);
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

Cypress.Commands.add("deleteUser", () => {
  const id = Cypress.env("currentUser").id;
  const type = Cypress.env("currentUser").type;

  if (type === 0) {
    cy.request({
      method: "PATCH",
      url: "users/inactivate",
      headers: {
        Authorization: `Bearer ${Cypress.env("accessToken")}`,
      },
    });
  }

  if (type === 1) {
    cy.request({
      method: "DELETE",
      url: `/users/${id}`,
      headers: {
        Authorization: `Bearer ${Cypress.env("accessToken")}`,
      },
    });
  }
});
