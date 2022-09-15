import { Provider } from '@nestjs/common'
import Stripe from 'stripe'

import { StripeModuleToken } from './constants/stripe-module-token.enum'
import { StripeModuleOptions } from './types/stripe-module-options.interface'

// export function createStripeClient(options: StripeModuleOptions): Provider<Stripe> {
//   return {
//     // provide: Stripe,
//     provide: STRIPE_CLIENT,
//     useValue: new Stripe(options.apiKey, { ...options.stripeConfig, typescript: true }),
//     // inject: [STRIPE_MODULE_OPTIONS],
//   }
// }

export function createStripeClientProvider(): Provider<Stripe> {
  return {
    provide: StripeModuleToken.STRIPE_CLIENT,
    useFactory: (options: StripeModuleOptions): Stripe => {
      return new Stripe(options.apiKey, { ...options.stripeConfig, typescript: true })
    },
    inject: [StripeModuleToken.STRIPE_MODULE_OPTIONS],
  }
}
