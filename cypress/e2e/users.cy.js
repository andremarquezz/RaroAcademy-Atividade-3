describe("Criação e consultas de usuarios na API Raro", () => {

  describe("Casos de sucesso", () => {

    it("Deve retornar status 201 e as informações esperadas para um novo usuário criado com sucesso", () => {
    
      cy.task("createRandomUser").then((randomUser) => {
        cy.request("POST", "/users", randomUser).then((responseUserCreated) => {
          const {body, status} = responseUserCreated;
     
          expect(status).to.eq(201);
          expect(body.id).to.be.a("number");
          
          cy.fixture("expectedUserCreatedResponse.json").then((expectedUserCreated) => {
            expect(body).to.have.all.keys(expectedUserCreated);
          });
        });
      });
    });
  
    // it("Deve retornar status 200 e as informações esperadas para um usuário consultado com sucesso", () => {

    //   cy.task("createRandomUser").then((randomUser) => {
    //     cy.request("POST", "/users", randomUser).then((responseUserCreated) => {
    //       const {body, status} = responseUserCreated;

    //       cy.request("GET", `/users/${body.id}`).then((user) => {

    //         expect(user.status).to.eq(200);
    //         cy.fixture("expectedUserCreatedResponse.json").then((expectedUserCreated) => {
    //           expect(user.body).to.have.all.keys(expectedUserCreated);
    //         });
    //       });
    //     });
    //   });
    // })

  })
})