/**
 * Generic type assertion function that throws an Error if the given input is **not** `NonNullable`,
 * i.e. if the given input is `null` or `undefined`.
 */
export function assertNonNullable<T>(input: T, message?: string): asserts input is NonNullable<T> {
  if (input === null || input === undefined) {
    throw Error(message ?? 'NonNullable assertion error: input value is null or undefined')
  }
}
