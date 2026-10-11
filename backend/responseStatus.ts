export const ResponseStatus = {
  SUCCESS:             { status: 200, code: 'SUCCESS',             message: 'Request completed successfully.' },
  CREATED:             { status: 201, code: 'CREATED',             message: 'Resource created successfully.' },
  NO_CONTENT:          { status: 204, code: 'NO_CONTENT',          message: 'No content.' },

  BAD_REQUEST:         { status: 400, code: 'BAD_REQUEST',         message: 'The request is invalid.' },
  INVALID_CREDENTIALS: { status: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
  UNAUTHORIZED:        { status: 401, code: 'UNAUTHORIZED',        message: 'Authentication is required.' },
  FORBIDDEN:           { status: 403, code: 'FORBIDDEN',           message: 'You do not have permission to access this resource.' },
  NOT_FOUND:           { status: 404, code: 'NOT_FOUND',           message: 'The requested resource was not found.' },

  INTERNAL_ERROR:      { status: 500, code: 'INTERNAL_ERROR',      message: 'Something went wrong. Please try again later.' },
} as const;

export type ResponseStatusType = (typeof ResponseStatus)[keyof typeof ResponseStatus];