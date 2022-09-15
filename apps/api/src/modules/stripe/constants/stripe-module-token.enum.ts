/**
 *
 */
// export const STRIPE_MODULE_OPTIONS = 'STRIPE_MODULE_OPTIONS_TOKEN'
// export const STRIPE_EVENT_KEY = 'STRIPE_EVENT_KEY'
// export const STRIPE_CLIENT = 'STRIPE_CLIENT'

// export const STRIPE_WEBHOOK_SERVICE = 'STRIPE_WEBHOOK_SERVICE'

/**
 * NestJS dependency injection tokens used by StripeModule.
 *
 * @see {@link https://docs.nestjs.com/fundamentals/custom-providers}
 */
export enum StripeModuleToken {
  STRIPE_MODULE_OPTIONS = 'STRIPE_MODULE_OPTIONS_TOKEN',
  STRIPE_EVENT_KEY = 'STRIPE_EVENT_KEY',
  STRIPE_CLIENT = 'STRIPE_CLIENT',
}
