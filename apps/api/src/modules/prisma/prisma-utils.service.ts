import { Injectable, NotFoundException } from '@nestjs/common'

import { processError } from './lib/process-error'

/**
 * NestJS service that exposes helper functions for Prisma + NestJS.
 *
 * @see {@link https://docs.nestjs.com/recipes/prisma}
 * @see {@link https://github.com/prisma/prisma-examples/tree/latest/typescript/rest-nestjs/src}
 */
@Injectable()
export class PrismaUtilsService {
  /**
   * Error helper that checks if the given input argument is an instance of a common Prisma query error
   * and if so, returns (vs. throws) an appropriate corresponding NestJS error.
   */
  processError(error: unknown): NotFoundException | unknown {
    return processError(error)
  }
}
