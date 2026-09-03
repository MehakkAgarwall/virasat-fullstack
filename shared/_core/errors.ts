// TEMP STUB — replace with real implementation, DO NOT deploy as-is.

export class AppError extends Error {
  constructor(message: string, public code: string = "INTERNAL_ERROR", public statusCode: number = 500) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, "FORBIDDEN", 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Not Found") {
    super(message, "NOT_FOUND", 404);
  }
}
