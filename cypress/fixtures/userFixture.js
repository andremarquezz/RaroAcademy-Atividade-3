export const userFixture = {
  user: {
    id: 0,
    name: "string",
    email: "string",
    type: 0,
    active: true,
  },
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
  errorPasswordTooShort: {
    message: ["password must be longer than or equal to 6 characters"],
    error: "Bad Request",
    statusCode: 400,
  },
  errorPasswordTooLong: {
    message: ["password must be shorter than or equal to 12 characters"],
    error: "Bad Request",
    statusCode: 400,
  },
};
