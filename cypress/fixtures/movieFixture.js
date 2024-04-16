export const movieFixture = {
  movie: {
    id: 0,
    title: "string",
    genre: "string",
    description: "string",
    totalRating: null,
    durationInMinutes: 0,
    releaseYear: 0,
  },
  errorTitleInvalid: {
    message: [
      "title must be longer than or equal to 1 characters",
      "title should not be empty",
    ],
    error: "Bad Request",
    statusCode: 400,
  },
  errorGenreInvalid: {
    message: [
      "genre must be longer than or equal to 1 characters",
      "genre should not be empty",
    ],
    error: "Bad Request",
    statusCode: 400,
  },
  errorDescriptionInvalid: {
    message: [
      "description must be longer than or equal to 1 characters",
      "description should not be empty",
    ],
    error: "Bad Request",
    statusCode: 400,
  },
  errorDurationInvalid: {
    message: [
      "durationInMinutes must be a number conforming to the specified constraints",
      "durationInMinutes should not be empty",
    ],
    error: "Bad Request",
    statusCode: 400,
  },
  errorReleaseYearInvalid: {
    message: [
      "releaseYear must be a number conforming to the specified constraints",
      "releaseYear should not be empty",
    ],
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
};
