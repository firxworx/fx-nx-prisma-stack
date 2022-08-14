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
            customProps: (_req, _res) => ({
              context: 'HTTP', // set context value 'HTTP' for auto http request logging re grouping, filtering, etc
            }),
            transport:
              process.env.NODE_ENV === 'production'
                ? undefined
                : {
                    // @see <https://github.com/pinojs/pino-pretty>
                    target: 'pino-pretty',
                    options: {
                      translateTime: true,
                      colorize: true,
                      singleLine: true,
                      sync: apiConfig.logger.sync,
                    },
                  },
            autoLogging: true, // toggle automatic 'request completed'/'request errored' log entries
            quietReqLogger: false,
            stream: pino.destination({
              minLength: 4096, // buffer logs before writing - applies when sync: true
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
  providers: [],
})
export class AppModule {}
