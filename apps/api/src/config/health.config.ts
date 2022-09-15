import { registerAs } from '@nestjs/config'
import { getEnvNumberValue } from './lib/env-values'
import type { HealthConfig } from './types/health-config.interface'

export default registerAs('health', (): HealthConfig => {
  return {
    httpPingUrl: process.env.HEALTH_CHECK_HTTP_PING_URL,
    maxHeapMiB: getEnvNumberValue('HEALTH_CHECK_MAX_HEAP_MIB'),
    maxRssMiB: getEnvNumberValue('HEALTH_CHECK_MAX_RSS_MIB'),
  }
})
