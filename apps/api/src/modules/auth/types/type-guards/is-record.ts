/**
 * Type guard that asserts the given input is a TypeScript `Record` (JavaScript object).
 *
 * This independent implementation is encapsulated within `AuthModule` per plans to independently publish
 * this module in future.
 */
export const isRecord = (x: unknown): x is Record<string | number | symbol, unknown> => {
  return x !== null && typeof x === 'object' && !Array.isArray(x)
}
