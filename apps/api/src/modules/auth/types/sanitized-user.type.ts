import { User } from '../../../generated/prisma-client'

export type SanitizedUser = Omit<User, 'password' | 'refreshToken'>
