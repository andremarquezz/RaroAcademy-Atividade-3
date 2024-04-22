import { faker } from "@faker-js/faker";
import { movieFixture } from "../fixtures/movieFixture";

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
          ({ body }) => {
            Cypress.env("currentMovie", body[0]);
            return body[0];
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

Cypress.Commands.add("deleteMovie", (idMovie) => {
  const id = idMovie || Cypress.env("currentMovie").id;
  const token = `Bearer ${Cypress.env("accessToken")}`;

  cy.request({
    method: "DELETE",
    url: `/movies/${id}`,
    headers: {
      Authorization: token,
    },
  });
});
