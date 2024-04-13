export const userFixture = {
  errorAlreadyExists: {
    message: "Email already in use",
    error: "Conflict",
    statusCode: 409,
  },
  errorEmailInvalid: {
    message: ["email must be an email"],
    error: "Bad Request",
    statusCode: 400,
  },
};
