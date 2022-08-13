import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import apiConfig from './config/api.config'
import authConfig from './config/auth.config'

import { AuthModule } from './modules/auth/auth.module'
import { PrismaModule } from './modules/prisma/prisma.module'
import { VideosModule } from './modules/videos/videos.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig, apiConfig],
    }),
    PrismaModule,
    AuthModule,
    VideosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
