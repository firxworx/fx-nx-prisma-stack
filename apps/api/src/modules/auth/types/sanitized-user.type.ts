import { User } from 'apps/api/src/generated/prisma-client'

export type SanitizedUser = Omit<User, 'password' | 'refreshToken'>
