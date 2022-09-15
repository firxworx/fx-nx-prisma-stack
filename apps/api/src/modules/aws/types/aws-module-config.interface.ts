import type { AwsCredentials } from './aws-credentials.interface'
import type { AwsSesConfig } from './aws-ses-config.interface'

export interface AwsModuleConfig {
  region: string
  credentials: AwsCredentials
  ses?: AwsSesConfig
}
