import { User } from '@prisma/client'

/**
 * Base user as authenticated by the AuthModule, including the trio of supported
 * user properties that are indexed fields in the database: `id`, `uuid`, and `email`.
 *
 * @see SanitizedUser
 */
export type AuthUser = Pick<User, 'id' | 'uuid' | 'email'>
