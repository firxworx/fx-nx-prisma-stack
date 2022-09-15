import { Test } from '@nestjs/testing'
import Stripe from 'stripe'

import { StripeModule } from '../stripe.module'

describe('StripeModule', () => {
  const apiKey = 'pk_abcdefg'

  // use type LatestApiVersion to enable detection of new versions in future package updates w/ type error
  const stripeApiVersion: Stripe.LatestApiVersion = '2022-08-01'

  const stripeConfig = {
    apiVersion: stripeApiVersion,
  }

  describe('register', () => {
    it('should register stripe module', async () => {
      const module = await Test.createTestingModule({
        imports: [StripeModule.register({ apiKey, stripeConfig })],
      }).compile()

      const stripe = module.get<Stripe>(Stripe)

      expect(stripe).toBeDefined()
      expect(stripe).toBeInstanceOf(Stripe)
    })
  })
})
