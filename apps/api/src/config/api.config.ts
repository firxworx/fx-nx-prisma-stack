import { registerAs } from '@nestjs/config'

import { mapEnvVarsToConfigOptionFlags, mapEnvVarsToConfigStringDict } from './lib/env-mapper'
import type { ApiConfig } from './types/api-config.interface'

const requiredCookieEnvsKeyMap: Record<string, keyof ApiConfig['cookies']> = {
  COOKIE_SECRET: 'secret',
}

const requiredOptionEnvsKeyMap: Record<string, keyof ApiConfig['options']> = {
  API_OPT_COMPRESSION: 'compression',
  API_OPT_CSRF_PROTECTION: 'csrfProtection',
}

/**
 * Support and conditionally remove any leading slash from the given base path: it is frequently
 * required in infra/IaC scenarios however must be omitted when specifying the global prefix for nestjs.
 */
const normalizeBasePath = (input: string): string => input.replace(/^\/+/, '')

export default registerAs('api', (): ApiConfig => {
  return {
    origin: process.env.ORIGIN || 'http://localhost:3333',
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
    globalPrefix: `${normalizeBasePath(String(process.env.BASE_PATH)) ?? 'api'}/${process.env.API_VERSION ?? 'v1'}`,
    meta: {
      projectTag: process.env.API_TAG_ID ?? 'fx',
    },
    cookies: mapEnvVarsToConfigStringDict(requiredCookieEnvsKeyMap),
    options: mapEnvVarsToConfigOptionFlags(requiredOptionEnvsKeyMap),
  }
})
