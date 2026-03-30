/**
 * PostgreSQL error shape returned by neon-serverless driver.
 * Used for typed catch blocks instead of `catch (error: any)`.
 */
export interface DatabaseError {
  code: string;
  message: string;
  detail?: string;
  constraint?: string;
}

export function isDatabaseError(error: unknown): error is DatabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as DatabaseError).code === 'string'
  );
}
