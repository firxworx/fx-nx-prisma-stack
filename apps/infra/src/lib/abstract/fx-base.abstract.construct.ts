import { Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'

import { DeployStage } from '../../constants/deploy-stage.enum'
import type { BaseProps } from '../../types/props.types'
import { getDeployStageTag } from './common'

export interface FxBaseConstructProps extends BaseProps {}

export abstract class FxBaseConstruct extends Construct {
  protected readonly project: Readonly<BaseProps['project']>
  protected readonly deploy: Readonly<BaseProps['deploy']>
  protected readonly meta: Readonly<BaseProps['meta']>

  constructor(parent: Stack, name: string, props: FxBaseConstructProps) {
    super(parent, name)

    this.project = {
      ...props.project,
    }

    this.deploy = {
      ...props.deploy,
    }

    this.meta = {
      ...props.meta,
    }
  }

  // @future could refactor to introduce a TS mixin to DRY these common methods between abstract construct + stack

  getDeployStage(): DeployStage {
    return this.deploy.stage
  }

  getDeployStageTag(): ReturnType<typeof getDeployStageTag> {
    return getDeployStageTag(this.deploy.stage)
  }

  getProjectTag(): string {
    return this.project.tag
  }

  isProduction(): boolean {
    return this.deploy.stage === DeployStage.PRODUCTION
  }

  isStaging(): boolean {
    return this.deploy.stage === DeployStage.STAGING
  }

  isProductionLike(): boolean {
    return this.isStaging() || this.isProduction()
  }

  isDevelopment(): boolean {
    return this.deploy.stage === DeployStage.DEV
  }

  isQA(): boolean {
    return this.deploy.stage === DeployStage.QA
  }
}
