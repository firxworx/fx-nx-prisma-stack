import type { ApiConfig } from './api-config.interface'
import type { AuthConfig } from './auth-config.interface'
import type { HealthConfig } from './health-config.interface'
import type { LoggerConfig } from './logger-config.interface'
import type { StripeConfig } from './stripe-config.interface'

export interface AppConfig {
  api: ApiConfig
  auth: AuthConfig
  logger: LoggerConfig
  health: HealthConfig
  stripe: StripeConfig
}
