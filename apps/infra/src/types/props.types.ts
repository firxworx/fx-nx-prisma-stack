import { DeployStage } from '../constants/deploy-stage.enum'

export interface BaseProps {
  project: {
    name: string
    tag: string
  }
  deploy: {
    stage: DeployStage
    domain: string
    options?: {
      useNonProductionDefaults?: boolean
    }
  }
  meta: {
    owner: string
    repo: string
  }
}
