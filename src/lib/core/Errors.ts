export class InvalidHandlerError extends Error {
  message = 'The provided handler function has an invalid signature';
}

export class InvalidConfigurationError extends Error {
  message = 'The SDK configuration is invalid';
}
