export type EnvVarToConfigKeyMap = Record<Uppercase<string>, string>

export const mapEnvVarsToConfigOptionFlags = <T extends EnvVarToConfigKeyMap>(
  keyMap: T,
): Record<T[keyof T], boolean> => {
  return Object.entries(keyMap).reduce((acc, [envVar, configKey]) => {
    const envValue = String(process.env[envVar])

    if (!(envValue === 'ON' || 'OFF')) {
      throw new Error(`Config Error: invalid value for env var ${envVar} - "ON" or "OFF" required`)
    }

    return { ...acc, [configKey]: envValue === 'ON' ? true : false }
  }, {} as Record<T[keyof T], boolean>)
}
