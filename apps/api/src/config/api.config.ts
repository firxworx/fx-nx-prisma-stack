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
    options: mapEnvOptionsToApiConfigOptions(),
  }
})
