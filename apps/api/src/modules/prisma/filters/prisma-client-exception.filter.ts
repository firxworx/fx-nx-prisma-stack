import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { Prisma } from '@prisma/client'
import type { Response } from 'express'

import { PrismaQueryErrorCode } from '../constants/prisma-query-error-code.enum'

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    const message = exception.message.replace(/\n/g, '')

    switch (exception.code) {
      case PrismaQueryErrorCode.RecordDoesNotExist: {
        response.status(HttpStatus.NOT_FOUND).json({
          code: HttpStatus.NOT_FOUND,
          message,
        })

        break
      }
      case PrismaQueryErrorCode.UniqueConstraintViolation: {
        response.status(HttpStatus.CONFLICT).json({
          code: HttpStatus.CONFLICT,
          message,
        })

        break
      }
      case PrismaQueryErrorCode.RecordsNotFound: {
        response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
          code: HttpStatus.CONFLICT,
          message,
        })

        break
      }

      // ... add cases for any other error codes where special handling is required - @todo rig up / install PrismaClientExceptionFilter

      default:
        super.catch(exception, host)
        break
    }
  }
}
