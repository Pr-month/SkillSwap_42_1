/** HTTP response status codes used in controllers, filters, and tests. */
export const HTTP_STATUS_CODE = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatusCodeValue =
  (typeof HTTP_STATUS_CODE)[keyof typeof HTTP_STATUS_CODE];
