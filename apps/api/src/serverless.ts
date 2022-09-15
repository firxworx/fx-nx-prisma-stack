import { Server } from 'http'
import { APIGatewayEvent, Handler, Context } from 'aws-lambda'
import * as serverlessExpress from 'aws-serverless-express'
import * as express from 'express'
import { NestFactory } from '@nestjs/core'
import { ExpressAdapter, type NestExpressApplication } from '@nestjs/platform-express'
import { ConfigService } from '@nestjs/config'
import type { Express } from 'express'

import { Logger } from 'nestjs-pino'

import { configureNestExpressApp } from './main'
import { AppModule } from './app.module'
import type { ApiConfig } from './config/types/api-config.interface'
import { assertNonNullable } from './types/type-assertions/assert-non-nullable'

// cache server in lambda environment
let server: Server

async function bootstrap(): Promise<Server> {
  const expressServer: Express = express()
  const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(expressServer), {
    bufferLogs: true, // @see <https://github.com/iamolegga/nestjs-pino> - confirm if best for lambda serverless
  })

  const logger = app.get(Logger)
  app.useLogger(logger)

  const configService = app.get<ConfigService>(ConfigService)
  const apiConfig = configService.get<ApiConfig>('api')

  assertNonNullable(apiConfig, 'Configuration error: missing ApiConfig')
  const { origin, port, globalPrefix } = apiConfig

  await configureNestExpressApp(app, apiConfig, logger)

  await app.init()

  logger.log(`🚀 Serverless application environment: ${process.env.NODE_ENV}`)
  logger.log(`🚀 Application initialized for port ${port} at path /${globalPrefix}`)
  logger.log(`🚀 Configured to accept requests from origin: ${origin}`)

  return serverlessExpress.createServer(expressServer, undefined, [])
}

export const apiGatewayHandler: Handler = async (event: APIGatewayEvent, context: Context): Promise<void> => {
  try {
    if (!server) {
      server = await bootstrap()
    }

    serverlessExpress.proxy(server, event, context)
  } catch (error: unknown) {
    console.error('Error bootstrapping serverless NestJS application')
    console.error((error instanceof Error && error.message) || String(error))

    if (error instanceof Error && error.stack) {
      console.error(error.stack || 'No stack trace available')
    }
  }
}
