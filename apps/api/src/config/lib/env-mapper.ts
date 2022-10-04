/**
 * Record that represents a mapping of uppercase environment variable names to corresponding
 * config object property names that adhere to JS/TS naming conventions.
 */
export type EnvVarToConfigKeyMap<K extends string = string, V = string> = Record<K, V>

// note: if keys must be defined in usage its a bit cumbersome to mess with the `Uppercase<>` utility type e.g.
// export type EnvVarToConfigKeyMap<K extends Uppercase<string> = Uppercase<string>, V = string> = Record<K, V>

/**
 * Helper function to map environment variable option flags with allowed values 'ON' or 'OFF' per project
 * convention to a dict-style Record in format `{ [configKey]: boolean }`.
 *
 * @throws `Error` if an environment variable with value that is not strictly "ON" or "OFF" is encountered.
 */
export const mapEnvVarsToConfigOptionFlags = <T extends EnvVarToConfigKeyMap>(
  keyMap: T,
): Record<T[keyof T], boolean> => {
  return Object.entries(keyMap).reduce((acc, [envVar, configKey]) => {
    const envValue = String(process.env[envVar])

    if (!(envValue === 'ON' || envValue === 'OFF')) {
      throw new Error(`Config Error: invalid value for env var ${envVar} - "ON" or "OFF" required`)
    }

    return { ...acc, [configKey as T[keyof T]]: envValue === 'ON' ? true : false }
  }, {} as Record<T[keyof T], boolean>)
}

/**
 * Helper function to map environment variable option flags with allowed values 'ON' or 'OFF' per project
 * convention to a dict-style Record in format `{ [configKey]: string }`.
 *
 * @throws `Error` if an environment variable with a trivial/undefined value is encountered.
 */
export const mapEnvVarsToConfigStringDict = <T extends EnvVarToConfigKeyMap>(keyMap: T): Record<T[keyof T], string> => {
  return Object.entries(keyMap).reduce((acc, [envVar, configKey]) => {
    const envValue = String(process.env[envVar])

    if (!envValue.trim()) {
      throw new Error(`Config Error: missing expected non-empty/non-nullish value for env var ${envVar}`)
    }

    return { ...acc, [configKey as T[keyof T]]: envValue }
  }, {} as Record<T[keyof T], string>)
}
