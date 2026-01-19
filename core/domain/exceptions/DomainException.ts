/**
 * Base Domain Exception
 * All domain-specific errors should extend this class
 */
export abstract class DomainException extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Object.setPrototypeOf(this, DomainException.prototype);
  }
}

/**
 * Validation Exception - thrown when domain validation fails
 */
export class ValidationException extends DomainException {
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(message: string, field?: string, value?: unknown) {
    super(message, "VALIDATION_ERROR");
    this.field = field;
    this.value = value;
  }
}

/**
 * Not Found Exception - thrown when an entity is not found
 */
export class NotFoundException extends DomainException {
  public readonly entityType: string;
  public readonly entityId: string | number;

  constructor(entityType: string, entityId: string | number) {
    super(`${entityType} with id ${entityId} not found`, "NOT_FOUND");
    this.entityType = entityType;
    this.entityId = entityId;
  }
}

/**
 * Authorization Exception - thrown when user is not authorized
 */
export class AuthorizationException extends DomainException {
  constructor(message: string = "Not authorized to perform this action") {
    super(message, "UNAUTHORIZED");
  }
}

/**
 * Conflict Exception - thrown when there's a conflict (e.g., duplicate)
 */
export class ConflictException extends DomainException {
  constructor(message: string) {
    super(message, "CONFLICT");
  }
}

/**
 * Invalid Rating Exception
 */
export class InvalidRatingException extends ValidationException {
  constructor(rating: number) {
    super(
      `Rating must be between 1 and 5, received: ${rating}`,
      "rating",
      rating,
    );
  }
}

/**
 * Invalid Content Exception
 */
export class InvalidContentException extends ValidationException {
  constructor(
    field: string,
    minLength: number,
    maxLength: number,
    actualLength: number,
  ) {
    super(
      `${field} must be between ${minLength} and ${maxLength} characters, received ${actualLength}`,
      field,
      actualLength,
    );
  }
}
