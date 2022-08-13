import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { SanitizedUser } from '../types/sanitized-user.type'

/**
 * Param decorator that returns the user as added to the express `request` object
 * by a PassportJS strategy when processing a request by an authenticated user.
 */
export const GetUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): SanitizedUser => {
  const request = ctx.switchToHttp().getRequest()
  return request.user
})
