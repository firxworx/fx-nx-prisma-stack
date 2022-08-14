import type { ApiConfig } from './api-config.interface'
import type { AuthConfig } from './auth-config.interface'

export interface AppConfig {
  api: ApiConfig
  auth: AuthConfig
}
