import { Test } from '@nestjs/testing'
import Stripe from 'stripe'

import { StripeModule } from '../stripe.module'
import { StripeModuleConfig } from '../types/stripe-module-config.interface'
import { STRIPE_API_VERSION } from '../constants/stripe-api-version.const'
import { StripeModuleToken } from '../constants/stripe-module-token.enum'

// yarn test:api --test-name-pattern=StripeModule

// @future requires additional tests for coverage of forRootAsync, useExisting, useClass module registrations

const mockStripeModuleConfig: StripeModuleConfig = {
  apiKey: process.env.STRIPE_API_KEY_TEST ?? '',
  stripeConfig: {
    apiVersion: STRIPE_API_VERSION,
  },
}

// const MOCK_CONFIG_SERVICE = {
//   get(key: string) {
//     switch (key) {
//       case 'stripe':
//         return mockStripeModuleConfig
//     }
//   },
// }

describe('StripeModule', () => {
  if (!mockStripeModuleConfig.apiKey.startsWith('sk_test_')) {
    throw new Error('StripeModule test requires valid environment value for STRIPE_API_KEY_TEST')
  }

  describe('register forRoot', () => {
    it('should register stripe module', async () => {
      const module = await Test.createTestingModule({
        imports: [StripeModule.register(mockStripeModuleConfig)],
      }).compile()

      const stripe = module.get<Stripe>(StripeModuleToken.STRIPE_CLIENT)

      expect(stripe).toBeDefined()
      expect(stripe).toBeInstanceOf(Stripe)
    })
  })
})
