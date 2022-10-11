import { NotFoundException } from '@nestjs/common'
import { NotFoundError, PrismaClientKnownRequestError } from '@prisma/client/runtime'

import { PrismaQueryErrorCode } from '../constants/prisma-query-error-code.enum'

/**
 * Helper function for Prisma query error handling that maps instances of common Prisma errors to
 * suitable corresponding NestJS errors or else returns the input argument without modification.
 *
 * Returns `NotFoundException` or the given error as-is if no match is implemented.
 */
export function processError(error: unknown): NotFoundException | unknown {
  // `NotFoundError`: thrown by select queries when configured to throw on not found
  if (error instanceof NotFoundError) {
    return new NotFoundException(error.message)
  }

  // error 'P2001': no record found e.g. from update/delete query
  if (error instanceof PrismaClientKnownRequestError && error.code === PrismaQueryErrorCode.RecordDoesNotExist) {
    return new NotFoundException(error.message)
  }

  // this._logger.error(error instanceof Error ? error.message : String(error))
  return error
}
