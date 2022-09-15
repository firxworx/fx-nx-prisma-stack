import type Stripe from 'stripe'

/**
 * Stripe API version.
 *
 * The type `LatestApiVersion` is by design for maintainability: it enables detection of new versions
 * in future package updates because legacy values will trigger a type issue.
 */
export const STRIPE_API_VERSION: Stripe.LatestApiVersion = '2022-08-01' as const
