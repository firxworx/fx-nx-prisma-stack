import { SetMetadata } from '@nestjs/common'

export const FX_KEY_IS_PUBLIC_ROUTE_HANDLER = 'FX_KEY_IS_PUBLIC_ROUTE_HANDLER'

/**
 * Decorator for controller methods to declaratively set a given endpoint + request type as being publicly accessible.
 *
 * **This decorator disables authentication.**
 *
 * `JwtAuthGuard` as exported by AuthModule will bypass authentication (i.e. allow public/unauthenticated requests)
 * when this decorator is applied.
 *
 * @see https://docs.nestjs.com/security/authentication
 */
export const PublicRouteHandler = () => SetMetadata(FX_KEY_IS_PUBLIC_ROUTE_HANDLER, true)
