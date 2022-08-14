import { registerAs } from '@nestjs/config'
import type { ApiConfig } from './types/api-config.interface'

const mapEnvOptionsToApiConfigOptions = (): ApiConfig['options'] => {
  const requiredEnvsKeyMap: Record<string, keyof ApiConfig['options']> = {
    API_OPT_COMPRESSION: 'compression',
    API_OPT_CSRF_PROTECTION: 'csrfProtection',
  }

  return Object.entries(requiredEnvsKeyMap).reduce((acc, [envVarName, configKey]) => {
    const value = String(process.env[envVarName])

    if (!['ON', 'OFF'].includes(value)) {
      throw new Error(`API config error: environment var ${envVarName} must be set with value of "ON" or "OFF"`)
    }

    acc[configKey] = value === 'ON' ? true : false

    return acc
  }, {} as ApiConfig['options'])
}

export default registerAs('api', (): ApiConfig => {
  return {
    origin: process.env.ORIGIN || 'http://localhost:3333',
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
    globalPrefix: `${process.env.BASE_PATH ?? 'api'}/${process.env.API_VERSION ?? 'v1'}`,
    meta: {
      projectTag: process.env.API_PROJECT_TAG ?? 'fx',
    },
    logger: {
      sync: String(process.env.API_LOGS_SYNC) === 'ON' ? true : process.env.NODE_ENV === 'test' ? true : false, // @todo refactor w/ DRY'd map function that provides validation
      logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug', // @todo add env option for log level config
    },
    options: mapEnvOptionsToApiConfigOptions(),
  }
})
