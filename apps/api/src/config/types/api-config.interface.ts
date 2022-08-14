export interface ApiConfig {
  origin: string
  port: number
  globalPrefix: string
  meta: {
    projectTag: string
  }
  logger: {
    /**
     * Flag for sync/async logging.
     *
     * Per docs, `sync` is usually best set to `true` for host environments that modify stdout e.g. AWS Lambda.
     *
     * @see <https://github.com/pinojs/pino/blob/master/docs/asynchronous.md>
     */
    sync: boolean
    /**
     * Minimum log level, defaults to `"info"` for production and `"debug"` otherwise.
     */
    logLevel: string
  }
  options: {
    csrfProtection: boolean
    compression: boolean
  }
}
