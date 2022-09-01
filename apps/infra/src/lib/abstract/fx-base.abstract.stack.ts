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

  getProjectTag(): string {
    return this.project.tag
  }

  /**
   * Returns `true` if the current infra deploy stage is `PRODUCTION`,
   * unless overridden by the `useNonProductionDefaults` deploy option.
   */
  isProduction(): boolean {
    if (!this.deploy.options?.useNonProductionDefaults) {
      return false
    }

    return this.deploy.stage === DeployStage.PRODUCTION
  }

  /**
   * Returns `true` if the current infra deploy stage is `STAGING`.
   */
  isStaging(): boolean {
    return this.deploy.stage === DeployStage.STAGING
  }

  /**
   * Returns `true` if the current infra deploy stage is `PRODUCTION` or `STAGING`,
   * unless overridden by the `useNonProductionDefaults` deploy option.
   */
  isProductionLike(): boolean {
    if (!this.deploy.options?.useNonProductionDefaults) {
      return false
    }

    return this.isStaging() || this.isProduction()
  }

  /**
   * Returns `true` if the current infra deploy stage is `DEV`.
   */
  isDevelopment(): boolean {
    return this.deploy.stage === DeployStage.DEV
  }

  /**
   * Returns `true` if the current infra deploy stage is `QA`.
   */
  isQA(): boolean {
    return this.deploy.stage === DeployStage.QA
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
