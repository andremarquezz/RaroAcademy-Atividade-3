const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://raromdb-3c39614e42d4.herokuapp.com/api",
    env: {
      currentUser: {},
      currentMovie: {},
      acessToken: "",
    },
    setupNodeEvents(on, config) {},
  },
});
