export const authFixture = {
  errorEmailInvalid: {
    message: ["email must be an email"],
    error: "Bad Request",
    statusCode: 400,
  },
  errorUnauthorized: {
    message: "Invalid username or password.",
    error: "Unauthorized",
    statusCode: 401,
  },
};
