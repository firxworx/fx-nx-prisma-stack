interface EnvHelperOptions<REQUIRED extends boolean = false> {
  required: REQUIRED
}

/**
 * Getter + validator for `process.env` environment variables containing numerical values.
 *
 * Provide the name of an environment variable as the first argument.
 *
 * Returns `number` or `undefined` based on the value of the environment variable and will throw
 * an error if a non-numerical value was found.
 *
 * If the options `required` flag is set, the function will throw an Error if the environment value
 * is not present instead of returning `undefined`.
 */
export const getEnvNumberValue = <REQUIRED extends boolean = false>(
  envVarName: string,
  options?: EnvHelperOptions<REQUIRED>,
): ReturnType<typeof envNumberValue> => {
  const value = process.env[envVarName]

  try {
    return envNumberValue(value, options)
  } catch (error: unknown) {
    throw new Error(
      `Environment variable validation error for '${envVarName}': ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
  }
}

/**
 * Type helper + validator for `process.env` environment variables containing numerical values.
 *
 * Returns either a `number` or `undefined` based on the input and will throw an error if a non-numerical
 * value is present.
 *
 * If the optional `options` `required` flag is set, this function will throw an Error if a value is
 * not present instead of returning `undefined`.
 */
export function envNumberValue<REQUIRED extends boolean>(
  input: string | undefined,
  options?: EnvHelperOptions<REQUIRED>,
): REQUIRED extends true ? number : number | undefined
export function envNumberValue(input: string | undefined, options?: EnvHelperOptions<boolean>): number | undefined {
  if (options?.required && typeof input === 'undefined') {
    throw new Error('numerical value is required')
  }

  if (!options?.required && typeof input === 'undefined') {
    return undefined
  }

  const numberValue = Number(input)

  if (isNaN(numberValue)) {
    throw new Error(`'${input}' is not a number`)
  }

  return numberValue
}
