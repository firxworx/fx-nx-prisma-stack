import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common'
import type { Response } from 'express'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

import type { RequestWithUser } from '../modules/auth/types/request-with-user.interface'

/**
 * Type guard that confirms if the type of the given argument statisfies the type: `Record<string, unknown>`.
 */
const isRecord = (x: unknown): x is Record<string, unknown> => {
  return typeof x === 'object' && x !== null // && !Array.isArray(x)
}

/**
 * Interceptor that logs input/output requests.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly ctxPrefix: string = this.constructor.name
  private readonly logger: Logger = new Logger(this.ctxPrefix)

  private customPrefix: string = ''

  /**
   * Set user prefix for context entries.
   * ex. [CustomPrefix - LoggingInterceptor - 200 - GET - /]
   */
  public setCustomPrefix(prefix: string): void {
    this.customPrefix = `${prefix} - `
  }

  /**
   * Intercept handler that logs before and after the request has been processed by NestJS.
   *
   * NestJS interceptors run after middleware and guards so they have access to `req.user` and
   * any other properties that may have been added in earlier stages of the request lifecycle.
   *
   * Note the nestjs-pino package logs requests via express middleware. This is ideal for capturing
   * events prior to processing (and potential sources of error) however the logs lack context and
   * will not contain user information if authentication is not implemented in middleware that is
   * guaranteed to load before the logger.
   *
   * @param context details about the current request
   * @param call$ implements `handle()` method and returns an Observable
   */
  public intercept(context: ExecutionContext, call$: CallHandler): Observable<unknown> {
    const req: RequestWithUser = context.switchToHttp().getRequest<RequestWithUser>()
    const { method, url, body, headers } = req

    const ctx: string = `${this.customPrefix}${this.ctxPrefix} - ${method} - ${url}${
      req.user?.email ? ' - ' + req.user.email : ''
    }`

    const message: string = `Request - ${method} - ${url} - ${req.user?.email}`

    // log incoming request
    this.logger.log(
      {
        message,
        method,
        body: this.sanitizeJsonBodyFields(body),
        headers,
      },
      ctx,
    )

    // log result + response
    return call$.handle().pipe(
      tap({
        next: (val: unknown): void => {
          this.logNext(val, context)
        },
        error: (err: Error): void => {
          this.logError(err, context)
        },
      }),
    )
  }

  /**
   * Log request + response information in the success/non-error case.
   *
   * @param body body returned
   * @param context details about the current request
   */
  private logNext(body: unknown, context: ExecutionContext): void {
    const req: RequestWithUser = context.switchToHttp().getRequest<RequestWithUser>()
    const res: Response = context.switchToHttp().getResponse<Response>()

    const { method, url } = req
    const { statusCode } = res

    const ctx: string = `${this.customPrefix}${this.ctxPrefix} - ${method} - ${statusCode} - ${url}`
    const message: string = `Response - ${statusCode} - ${method} - ${url}`

    this.logger.log(
      {
        message,
        body,
      },
      ctx,
    )
  }

  /**
   * Log request + response information in the error case.
   *
   * @param error Error object
   * @param context details about the current request
   */
  private logError(error: Error, context: ExecutionContext): void {
    const req: RequestWithUser = context.switchToHttp().getRequest<RequestWithUser>()
    const { method, url, body } = req

    if (error instanceof HttpException) {
      const statusCode: number = error.getStatus()

      const ctx: string = `${this.customPrefix}${this.ctxPrefix} - ${statusCode} - ${method} - ${url}`

      const payload = {
        method,
        url,
        body,
        message: `Response - ${statusCode} - ${method} - ${url}`,
        error,
      }

      if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(payload, error.stack, ctx)
      } else {
        this.logger.warn(payload, ctx)
      }

      return
    }

    const fallBackPayload = {
      message: `Response - ${method} - ${url}`,
    }

    if (error instanceof Error) {
      this.logger.error(fallBackPayload, error.stack, `${this.customPrefix}${this.ctxPrefix} - ${method} - ${url}`)
      return
    }

    this.logger.error(fallBackPayload, String(error))
  }

  private sanitizeJsonBodyFields(body: unknown): unknown {
    if (isRecord(body)) {
      const { password, refreshToken, ...restBody } = body
      return {
        ...(password ? { password: '**REDACTED**' } : {}),
        ...(refreshToken ? { refreshToken: '**REDACTED**' } : {}),
        ...restBody,
      }
    }

    return body
  }
}
