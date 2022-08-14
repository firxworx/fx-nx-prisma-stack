import {
  ClassSerializerInterceptor,
  HttpStatus,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
  // Logger,
} from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { Logger } from 'nestjs-pino'
import { useContainer } from 'class-validator'

import type { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import * as cookieParser from 'cookie-parser'
import * as csurf from 'csurf'
import * as compression from 'compression'

import { AppModule } from './app.module'
import { PrismaService } from './modules/prisma/prisma.service'
import type { ApiConfig } from './config/types/api-config.interface'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true, // @see readme of nestjs-pino
  })
  const logger = app.get(Logger)
  app.useLogger(logger)

  // const app = await NestFactory.create<NestExpressApplication>(AppModule)

  const configService = app.get<ConfigService>(ConfigService)
  const apiConfig = configService.get<ApiConfig>('api')

  if (!apiConfig) {
    throw new Error('Configuration error: missing ApiConfig')
  }

  const { origin, port, globalPrefix } = apiConfig

  // set global prefix for api (e.g. `api/v1`)
  app.setGlobalPrefix(globalPrefix, {
    exclude: [], // e.g. ['/path/to/healthcheck', '/path/to/hook']
  })

  // disable underlying expressjs from identifying itself in response headers
  app.disable('x-powered-by')

  // enable class-validator to use classes via NestJS direct injection (DI)
  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  // enable provider `onApplicationShutdown()` hooks to be called (also important for health checks)
  app.enableShutdownHooks()

  // add listener for prisma onExit event to prevent prisma from interfering w/ nestjs shutdown hooks
  const prismaService: PrismaService = app.get(PrismaService)
  await prismaService.enableShutdownHooks(app)

  // enable ClassSerializerInterceptor to serialize dto/entity classes returned as responses to json
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,
      enableImplicitConversion: false, // explicit false - reinforce rigorous behavior
    }),
  )

  // configure ValidationPipe to globally process incoming requests
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip validated object of properties that are not class properties w/ validation decorators
      transform: true, // enable class-transformer to transform js objects to classes via `plainToClass()` (use with `@Type()` decorator)
      transformOptions: {
        enableImplicitConversion: false,
      },
      forbidNonWhitelisted: true, // throw if an unrecognized property is received
      forbidUnknownValues: true, // recommended per class-validator npm page
      // disableErrorMessages: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      exceptionFactory: (errors: ValidationError[]) =>
        new UnprocessableEntityException({
          message: 'Unprocessable Entity',
          errors: errors.reduce(
            (acc, curr) => ({
              ...acc,
              [curr.property]: Object.values(curr.constraints ?? {}).join(', '),
            }),
            {},
          ),
        }),
    }),
  )

  // enable cors for REST endpoints only (graphql/apollo requires separate configuration if used)
  app.enableCors({
    origin,
    credentials: true, // required for auth cookies
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    // allowedHeaders: ...
  })

  // cookie-parser (express middleware) populates `req.cookies`
  app.use(cookieParser()) // @todo add cookie secret set via config -> env when setting up cookie-parser

  // conditionally enable csurf (express middleware) for csrf/xsrf protection (initializion must follow cookie-parser)
  if (apiConfig.options.csrfProtection) {
    // the _csrf cookie stores the token secret client-side so httpOnly is required to block access by js
    const csurfMiddleware = csurf({
      cookie: { key: '_csrf', sameSite: 'strict', httpOnly: true, secure: process.env.NODE_ENV === 'production' },
    })

    // csurf is added via middleware function to provide a lever for conditionally disabling csrf protection by route
    app.use((req: Request, res: Response, next: NextFunction) => {
      // example of disabling csrf protection for a given path
      // if (req.path === `${globalPrefix}/example-route/example`) return next()
      // note: auth routes for ui's should have csrf protection enabled to mitigate login csrf attacks

      csurfMiddleware(req, res, next)
    })

    // send csrf token to client via cookie in every request - client js must read the value and include via http header
    // the csurf middleware supports a few client request headers including CSRF-TOKEN, XSRF-TOKEN, X-XSRF-TOKEN, etc
    app.use((req: Request, res: Response, next: NextFunction) => {
      res.cookie('CSRF-TOKEN', req.csrfToken(), {
        httpOnly: false,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      })
      next()
    })
  }

  // conditionally enable express middleware for compression
  if (apiConfig.options.compression) {
    logger.log('Enabling compression via express middleware')
    app.use(compression())
  }

  // use helmet to add common http headers that enhance security
  app.use(
    helmet({
      // contentSecurityPolicy: { directives: {...} }
    }),
  )

  const httpServer = await app.listen(port, () => {
    logger.log(`🚀 Application environment: ${process.env.NODE_ENV}`)
    logger.log(`🚀 Application listening on port ${port} at path /${globalPrefix}`)
    logger.log(`🚀 Accepting requests from origin: ${origin}`)
  })

  const url = await app.getUrl()
  logger.log(`🚀 Application running: ${url}`)

  if (process.env.NODE_ENV === 'development') {
    logger.log(`🚀 Local development URL: http://localhost:${port}/${globalPrefix}`)
  }

  return httpServer
}

try {
  bootstrap()
} catch (error: unknown) {
  console.error('Error bootstrapping NestJS application')
  console.error((error instanceof Error && error.message) || String(error))

  if (error instanceof Error && error.stack) {
    console.error(error.stack || 'No stack trace available')
  }
}
