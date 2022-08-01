/**
 * Type-guard that evaluates if the input argument is a TypeScript Record.
 */
export const isRecord = (x: unknown): x is Record<string | number | symbol, unknown> => {
  return x !== null && typeof x === 'object' && !Array.isArray(x)
}
