import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { LoggerModule } from 'nestjs-pino'

import apiConfig from './config/api.config'
import authConfig from './config/auth.config'
import loggerConfig from './config/logger.config'
import healthConfig from './config/health.config'

import { AuthModule } from './modules/auth/auth.module'
import { PrismaModule } from './modules/prisma/prisma.module'
import { VideosModule } from './modules/videos/videos.module'
import { AppConfig } from './config/types/app-config.interface'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { LoggingInterceptor } from './interceptors/logging.interceptor'
import { LoggerConfig } from './config/types/logger-config.interface'
import { HealthModule } from './modules/health/health.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true, // cache process.env in memory
      load: [authConfig, apiConfig, loggerConfig, healthConfig],
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => {
        const loggerConfig = configService.get<LoggerConfig>('logger')

        if (!loggerConfig) {
          throw new Error('Missing expected LoggerConfig')
        }

        return loggerConfig.nestJsPino
      },
    }),
    HealthModule,
    PrismaModule,
    AuthModule,
    VideosModule,
  ],
  controllers: [],
  providers: [
    // uncomment to require authentication + protect all routes by default with JwtAuthGuard
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
