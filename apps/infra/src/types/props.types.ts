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
      /**
       * Flag to override isProduction() + isProductionLike() flags such that cost-saving non-production
       * conditional defaults will apply in stacks and constructs when the project is deployed using
       * `DeployStage.PRODUCTION`.
       *
       * This flag should only be set for low-risk deployments that are not business critical.
       * Supports use-cases of pre-launch previews/qa, and deployments of low-risk projects to apex domain.
       */
      useNonProductionDefaults?: boolean
    }
  }
  meta: {
    owner: string
    repo: string
  }
}
