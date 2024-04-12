const { defineConfig } = require("cypress");
const { faker } = require('@faker-js/faker');

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://raromdb-3c39614e42d4.herokuapp.com/api",
    env: {
      acessToken: "",
    },
    setupNodeEvents(on, config) {
      on("task",{
        createRandomUser() {
          return {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            password: "123456",
          };
        }
      })
    },
  },
});
