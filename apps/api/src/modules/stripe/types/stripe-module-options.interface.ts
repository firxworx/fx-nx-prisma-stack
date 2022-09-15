import type { StripeModuleConfig } from './stripe-module-config.interface'

export interface StripeModuleOptions extends StripeModuleConfig {
  global?: boolean
}
