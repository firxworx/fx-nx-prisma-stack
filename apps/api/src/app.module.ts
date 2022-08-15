import * as os from 'os'

import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import pino from 'pino'
import { LoggerModule } from 'nestjs-pino'

import apiConfig from './config/api.config'
import authConfig from './config/auth.config'

import { AuthModule } from './modules/auth/auth.module'
import { PrismaModule } from './modules/prisma/prisma.module'
import { VideosModule } from './modules/videos/videos.module'
import { ApiConfig } from './config/types/api-config.interface'
import { AppConfig } from './config/types/app-config.interface'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { LoggingInterceptor } from './interceptors/logging.interceptor'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true, // cache process.env in memory
      load: [authConfig, apiConfig],
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => {
        const apiConfig = configService.get<ApiConfig>('api')

        if (!apiConfig) {
          throw new Error('Missing expected ApiConfig')
        }

        return {
          // @see <https://github.com/pinojs/pino-http>
          pinoHttp: {
            base: {
              app: apiConfig.meta.projectTag,
              hostname: os.hostname(),
            },
            level: apiConfig.logger.logLevel,

            // set context value 'HTTP' for auto http request logging to facilitate grouping, filtering, etc
            customProps: (_req, _res) => ({
              context: 'HTTP',
            }),

            // set custom log levels depending on response status code
            // note: nestjs-pino maps pino `trace` and `info` to nestjs `verbose` and `log` to satisfy LoggerService interface
            customLogLevel: (_req, res): pino.LevelWithSilent => {
              // if (res.err)...
              if (res.statusCode >= 500) {
                return 'error'
              }

              if (res.statusCode >= 400) {
                return 'warn'
              }

              return 'info'
            },

            // set a request identifier - @see <https://github.com/pinojs/pino-http#pinohttpopts-stream>
            // @future note could also leverage aws for request tracing features
            // genReqId: (req: Record<string, any>): { sessionId: string; reqId: string } => ({
            //   // https://github.com/goldbergyoni/nodebestpractices/blob/49da9e5e41bd4617856a6ecd847da5b9c299852e/sections/production/assigntransactionid.md
            //   sessionId: req.session?.id,
            //   reqId: uuid(),
            // }),

            transport:
              process.env.NODE_ENV === 'production'
                ? undefined
                : {
                    // @see <https://github.com/pinojs/pino-pretty>
                    target: 'pino-pretty',
                    options: {
                      // levelFirst: true,
                      // translateTime: "yyyy-MM-dd'T'HH:mm:ss.l'Z'", // @see options at <https://www.npmjs.com/package/dateformat>
                      // colorize: true,
                      singleLine: true,
                      // errorLikeObjectKeys: ['err', 'error'],
                      sync: apiConfig.logger.sync,

                      // unused
                      // translateTime: 'UTC:yyyy-mm-dd hh:MM:ss TT Z',
                      // ignore: "pid,hostname,context,req,res,responseTime",
                      // messageFormat: '{req.headers.x-correlation-id} [{context}] {msg}',
                    },
                  },
            autoLogging: false, // toggle automatic 'request completed'/'request errored' log entries
            quietReqLogger: false,
            stream: pino.destination({
              minLength: 4096, // buffer logs before writing (applies when sync: true)
              sync: apiConfig.logger.sync, // sync: false enables asynchronous logging
            }),
          },
          // exclude: [{ method: RequestMethod.ALL, path: 'healthcheck' }], // e.g. exclude healthcheck logs
        }
      },
    }),
    PrismaModule,
    AuthModule,
    VideosModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
