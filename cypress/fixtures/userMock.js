export const userMock = {
  defaultUserData: {
    id: 0,
    name: "string",
    email: "string",
    type: 0,
    active: true,
  },
  errorUserAlreadyExistsResponse: {
    message: "Email already in use",
    error: "Conflict",
    statusCode: 409,
  },
  errorUserEmailInvalidResponse: {
    message: ["email must be an email"],
    error: "Bad Request",
    statusCode: 400,
  },
};
