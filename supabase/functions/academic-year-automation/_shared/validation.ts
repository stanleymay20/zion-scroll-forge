// Shared validation utilities for academic year automation

export function validateLength(value: string | undefined, maxLength: number, fieldName: string): void {
  if (value && value.length > maxLength) {
    throw new Error(`${fieldName} exceeds maximum length of ${maxLength} characters`);
  }
}

export function validateUUID(value: string | undefined, fieldName: string): void {
  if (value && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new Error(`${fieldName} must be a valid UUID`);
  }
}

export function validateRequired(value: any, fieldName: string): void {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${fieldName} is required`);
  }
}

export function validateDate(value: string | undefined, fieldName: string): void {
  if (value) {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error(`${fieldName} must be a valid date`);
    }
  }
}

export function validateEnum(value: string | undefined, allowedValues: string[], fieldName: string): void {
  if (value && !allowedValues.includes(value)) {
    throw new Error(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
  }
}

export function sanitizeString(value: string): string {
  return value
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
}
