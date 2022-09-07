export interface HealthConfig {
  /** healthcheck ping url to verify http connectivity (+ dns too if provided a url with a domain name). */
  httpPingUrl: string | undefined
  /** healthcheck threshold for max heap size in MiB. */
  maxHeapMiB: number | undefined
  /** healthcheck threshold for max rss (resident set size) in MiB. */
  maxRssMiB: number | undefined
}
