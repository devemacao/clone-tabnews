import {
  InternalServerError,
  MethodNotAllowedErrorError,
  ValidationError,
  NotFoundError,
} from "infra/errors";

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedErrorError();
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function oneErrorHandler(error, request, response) {
  if (error instanceof ValidationError || error instanceof NotFoundError) {
    return response.status(error.statusCode).json(error);
  }
  const publicErrorObject = new InternalServerError({
    statusCode: error.statusCode,
    cause: error,
  });
  console.log(publicErrorObject);
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: oneErrorHandler,
  },
};

export default controller;
