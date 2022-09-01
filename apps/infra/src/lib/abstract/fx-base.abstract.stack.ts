import * as cdk from 'aws-cdk-lib'
import { Tags } from 'aws-cdk-lib'
import { Construct } from 'constructs'

import { DeployStage } from '../../constants/deploy-stage.enum'
import type { BaseProps } from '../../types/props.types'
import { getDeployStageTag } from './common'

export interface FxBaseStackProps extends cdk.StackProps, BaseProps {}

export abstract class FxBaseStack extends cdk.Stack {
  protected readonly project: Readonly<BaseProps['project']>
  protected readonly deploy: Readonly<BaseProps['deploy']>
  protected readonly meta: Readonly<BaseProps['meta']>

  constructor(scope: Construct, id: string, props: FxBaseStackProps) {
    super(scope, id, props)

    this.project = {
      ...props.project,
    }

    this.deploy = {
      ...props.deploy,
    }

    this.meta = {
      ...props.meta,
    }

    this._applyTags()
  }

  // @future could refactor to introduce a TS mixin to DRY these common methods between abstract construct + stack

  getDeployStage(): DeployStage {
    return this.deploy.stage
  }

  getDeployStageTag(): ReturnType<typeof getDeployStageTag> {
    return getDeployStageTag(this.deploy.stage)
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

  getProjectTag(): string {
    return this.project.tag
  }

  protected getBaseProps(): BaseProps {
    return {
      project: this.project,
      deploy: this.deploy,
      meta: this.meta,
    }
  }

  /**
   * Apply a standard set of AWS resource tags to the stack.
   */
  private _applyTags(): void {
    const prefix = 'Fx' // namespace prefix for each AWS resource tag

    const tagTuples = [
      ['ProjectName', this.project.name],
      ['ProjectTag', this.project.tag],
      ['DeployStage', this.deploy.stage],
      ['IaCMethod', 'aws-cdk'],
      ['IaCRepo', this.meta.repo],
      ['DeployOwner', this.meta.owner],
    ].map((tuple) => [`${prefix}${tuple[0]}`, tuple[1]])

    tagTuples.forEach((tuple) => {
      Tags.of(this).add(tuple[0], tuple[1])
    })
  }
}
