import { Controller, Get } from '@nestjs/common'
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorFunction,
  HttpHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus'
import type { HealthCheckResult } from '@nestjs/terminus'
import { ApiExcludeController } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'

import type { HealthConfig } from '../../config/types/health-config.interface'
import { PublicRouteHandler } from '../auth/decorators/public-route-handler.decorator'

@ApiExcludeController()
@Controller('health-check')
export class HealthController {
  constructor(
    private configService: ConfigService,
    private healthCheckService: HealthCheckService,
    private httpHealthIndicator: HttpHealthIndicator,
    private memoryHealthIndicator: MemoryHealthIndicator,
  ) {}

  @Get()
  @PublicRouteHandler()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    const config = this.configService.get<HealthConfig>('health')

    if (!config) {
      throw new Error('Error resolving health check config')
    }

    const healthChecks: HealthIndicatorFunction[] = [
      // async () => this.prismaHealthIndicator.pingCheck('database', { timeout: 1500 }),
    ]

    if (config.httpPingUrl) {
      healthChecks.push(async () => this.httpHealthIndicator.pingCheck('httpPing', config.httpPingUrl!))
    }

    if (config.maxHeapMiB) {
      healthChecks.push(async () =>
        this.memoryHealthIndicator.checkHeap('memoryHeap', Number(config.maxHeapMiB) * 1024 * 1024),
      )
    }

    if (config.maxRssMiB) {
      healthChecks.push(async () =>
        this.memoryHealthIndicator.checkRSS('memoryRss', Number(config.maxRssMiB) * 1024 * 1024),
      )
    }

    return this.healthCheckService.check(healthChecks)
  }
}
