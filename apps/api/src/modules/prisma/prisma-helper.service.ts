import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { NotFoundError, PrismaClientKnownRequestError } from '@prisma/client/runtime'

import { PrismaQueryErrorCode } from './constants/prisma-query-error-code.enum'

/**
 * NestJS service that exposes helper functions for Prisma + NestJS.
 *
 * @see {@link https://docs.nestjs.com/recipes/prisma}
 * @see {@link https://github.com/prisma/prisma-examples/tree/latest/typescript/rest-nestjs/src}
 */
@Injectable()
export class PrismaHelperService {
  private logger = new Logger(this.constructor.name)

  /**
   * This function will check if the input argument is a common Prisma query error and if so it will
   * return (vs. throw) the appropriate corresponding NestJS Exception.
   *
   * Intended for use within the `catch()` handler of a try/catch block.
   *
   * For example: if given a Prisma `PrismaClientKnownRequestError` with `code` "P2001" aka
   * `PrismaQueryErrorCode.RecordDoesNotExist`, the function will throw a NestJS `NotFoundException`.
   *
   * All errors are logged. Any unsupported cases will be logged + returned without modification.
   */
  handleError(error: unknown): NotFoundException | unknown {
    // `NotFoundError` is thrown by select queries e.g. when throw on error behavior is enabled
    if (error instanceof NotFoundError) {
      this.logger.warn(error.message)

      this.logger.warn(JSON.stringify(error, null, 2))

      return new NotFoundException(error.message)
    }

    // error with code 'P2001' is thrown when no record is found by update/delete queries
    if (error instanceof PrismaClientKnownRequestError && error.code === PrismaQueryErrorCode.RecordDoesNotExist) {
      this.logger.warn(error.message)

      return new NotFoundException(error.message)
    }

    this.logger.error(error instanceof Error ? error.message : String(error))
    return error
  }
}
