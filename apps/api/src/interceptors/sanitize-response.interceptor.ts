import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { map, Observable } from 'rxjs'

const PROPERTY_NAME_BLACKLIST = ['password', 'refreshToken']

const isObject = (input: unknown): input is Record<string, unknown> => {
  return !!input && typeof input === 'object' && !Array.isArray(input)
}

const sanitizeResponseValues = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sanitizeResponseValues)
  }

  if (isObject(value)) {
    return Object.entries(value).map(([key, value]) => {
      if (PROPERTY_NAME_BLACKLIST.includes(key)) {
        return [key, undefined]
      }

      if (Array.isArray(value) || isObject(value)) {
        return [key, sanitizeResponseValues(value)] // eslint-disable-line @typescript-eslint/no-unused-vars
      }

      return [key, value]
    })
  }

  return value
}

@Injectable()
export class SanitizeResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((value) => sanitizeResponseValues(value)))
  }
}
