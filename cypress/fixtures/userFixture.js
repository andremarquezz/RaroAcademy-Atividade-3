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
  errorUnauthorized: {
    message: "Access denied.",
    error: "Unauthorized",
    statusCode: 401,
  },
  errorForbidden: {
    message: "Forbidden",
    statusCode: 403,
  },
  errorReviewMovieIdRequired: {
    message: [
      "movieId must be an integer number",
      "movieId should not be empty",
    ],
    error: "Bad Request",
    statusCode: 400,
  },
  errorReviewScoreInvalid: {
    message: "Score should be between 1 and 5",
    error: "Bad Request",
    statusCode: 400,
  },
  errorReviewTextStringRequired: {
    message: ["reviewText must be a string"],
    error: "Bad Request",
    statusCode: 400,
  },
};
