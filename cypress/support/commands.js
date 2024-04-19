import { faker } from "@faker-js/faker";
import { movieFixture } from "../fixtures/movieFixture";

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

Cypress.Commands.add("createRandomMovie", () => {
  const pastDate = faker.date.past();
  const releaseYearFake = pastDate.getFullYear();
  return {
    title: faker.lorem.words(5),
    genre: faker.lorem.words(5),
    description: faker.lorem.sentence(),
    durationInMinutes: faker.number.int(140),
    releaseYear: releaseYearFake,
  };
});

Cypress.Commands.add("createAndFetchMovie", () => {
  cy.adminLogin().then(() => {
    cy.createRandomMovie().then((randomMovie) => {
      cy.request({
        method: "POST",
        url: "/movies",
        body: randomMovie,
        headers: {
          Authorization: `Bearer ${Cypress.env("accessToken")}`,
        },
      }).then(() => {
        cy.request("GET", `/movies/search?title=${randomMovie.title}`).then(
          (responseMovie) => {
            return responseMovie.body[0];
          }
        );
      });
    });
  });
});

Cypress.Commands.add("createReview", () => {
  cy.createAndFetchMovie().then((movie) => {
    cy.request({
      method: "POST",
      url: "users/review",
      body: { ...movieFixture.review, movieId: movie.id },
      headers: {
        Authorization: `Bearer ${Cypress.env("accessToken")}`,
      },
    }).then(() => {
      cy.request("GET", `/movies/${movie.id}`).then((responseMovie) => {
        return responseMovie;
      });
    });
  });
});
