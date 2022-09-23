import { SetMetadata } from '@nestjs/common'

export const FX_KEY_IS_PUBLIC_ROUTE_HANDLER = 'FX_KEY_IS_PUBLIC_ROUTE_HANDLER' as const

/**
 * Public route decorator for controller route handler methods that disables authentication and exposes the
 * decorated route as a public route.
 *
 * **WARNING: applying this decorator will disable authentication**
 *
 * Controller methods decorated with `@PublicRouteHandler()` will be exempt from any authentication requirements
 * enforced by the `AuthModule`'s `JwtAuthGuard`.
 *
 * This decorator is useful for implementing public endpoints in cases where `JwtAuthGuard` is applied globally
 * or class-level on a controller.
 *
 * @see https://docs.nestjs.com/security/authentication
 */
export const PublicRouteHandler = (): void => {
  SetMetadata(FX_KEY_IS_PUBLIC_ROUTE_HANDLER, true)
}
