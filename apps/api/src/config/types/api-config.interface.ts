export interface ApiConfig {
  origin: string
  port: number
  globalPrefix: string
  meta: {
    projectTag: string
  }
  cookies: {
    secret: string
  }
  options: {
    csrfProtection: boolean
    compression: boolean
  }
}
