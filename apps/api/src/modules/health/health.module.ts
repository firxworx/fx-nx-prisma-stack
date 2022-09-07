import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { TerminusModule } from '@nestjs/terminus'

import { HealthController } from './health.controller'

/**
 * Module implements a health check powered by terminus via `@nestjs/terminus`.
 *
 * The module's `HealthController` exposes the health check endpoint: `/health-check`.
 */
@Module({
  imports: [ConfigModule, HttpModule, TerminusModule], // PrismaModule
  controllers: [HealthController],
  providers: [],
})
export class HealthModule {}
