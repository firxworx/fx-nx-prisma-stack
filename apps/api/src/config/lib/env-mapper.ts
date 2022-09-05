/**
 * Record that represents a mapping of uppercase environment variable names to their
 * JS/TS-convention-friendly config key names.
 */
export type EnvVarToConfigKeyMap<K extends string = string, V = string> = Record<K, V>

// meh... if keys must be defined in usage its a bit cumbersome to mess with `Uppercase<>` utility type
// export type EnvVarToConfigKeyMap<K extends Uppercase<string> = Uppercase<string>, V = string> = Record<K, V>

/**
 * Helper function to map environment variable option flags which by project convention
 * have values 'ON' or 'OFF' to a dict-style Record in format `{ [configKey]: boolean }`
 * as applicable to config options.
 */
export const mapEnvVarsToConfigOptionFlags = <T extends EnvVarToConfigKeyMap>(
  keyMap: T,
): Record<T[keyof T], boolean> => {
  return Object.entries(keyMap).reduce((acc, [envVar, configKey]) => {
    const envValue = String(process.env[envVar])

    if (!(envValue === 'ON' || 'OFF')) {
      throw new Error(`Config Error: invalid value for env var ${envVar} - "ON" or "OFF" required`)
    }

    return { ...acc, [configKey as T[keyof T]]: envValue === 'ON' ? true : false }
  }, {} as Record<T[keyof T], boolean>)
}
