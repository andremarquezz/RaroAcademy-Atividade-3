export const movieFixture = {
  movie: {
    id: 0,
    title: "string",
    genre: "string",
    description: "string",
    durationInMinutes: 0,
    releaseYear: 0,
    totalRating: 0,
  },
  errorTitleInvalid: {
    message: [
      "title must be longer than or equal to 1 characters",
      "title should not be empty",
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
