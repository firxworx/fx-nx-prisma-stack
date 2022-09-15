import Stripe from 'stripe'

export interface StripeModuleConfig {
  apiKey: string
  stripeConfig: Stripe.StripeConfig
  defaultCurrency?: string
}
