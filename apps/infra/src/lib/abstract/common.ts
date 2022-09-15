import { DeployStage } from '../../constants/deploy-stage.enum'

/**
 * Return a concise lowercase "tag" that corresponds to the given `DeployStage` that is
 * compatible with DNS/URL's and AWS resource names/identifiers.
 *
 * Handy for consistent naming of URL's + resources + identifiers within AWS per project conventions
 * when they are for different deployment stages.
 *
 * @see FxBaseConstruct
 * @see FxBaseStack
 */
export function getDeployStageTag(deployStage: DeployStage): 'dev' | 'staging' | 'prod' | 'qa' {
  switch (deployStage) {
    case DeployStage.DEV: {
      return 'dev'
    }
    case DeployStage.STAGING: {
      return 'staging'
    }
    case DeployStage.PRODUCTION: {
      return 'prod'
    }
    case DeployStage.QA: {
      return 'qa'
    }
    default: {
      throw new Error(`Encountered unsupported/unimplemented deploy stage: ${deployStage}`)
    }
  }
}
