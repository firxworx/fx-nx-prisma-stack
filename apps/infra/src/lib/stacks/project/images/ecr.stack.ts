import { Construct } from 'constructs'
import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib'

import * as ecr from 'aws-cdk-lib/aws-ecr'

import { FxBaseStack, type FxBaseStackProps } from '../../../abstract/fx-base.abstract.stack'

export interface EcrStackProps extends FxBaseStackProps {
  imageScanOnPush?: boolean
  removalPolicy?: RemovalPolicy
  maxImageCount?: number
}

export class EcrStack extends FxBaseStack {
  readonly repository: ecr.Repository

  constructor(scope: Construct, id: string, props: EcrStackProps) {
    super(scope, id, props)

    this.repository = new ecr.Repository(this, 'Repository', {
      repositoryName: `${this.getProjectTag()}-${this.getDeployStageTag()}`,
      imageScanOnPush: props.imageScanOnPush ?? this.isProduction(),
      lifecycleRules: [
        {
          maxImageCount: props.maxImageCount ?? 3,
        },
      ],
      removalPolicy: props.removalPolicy ?? this.isProduction() ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      // imageTagMutability: ecr.TagMutability.IMMUTABLE, // @todo immutable tags are a security best-practice
      // encryption
    })

    this.printOutputs()
  }

  private printOutputs(): void {
    new CfnOutput(this, 'EcrOutput', {
      value: this.repository.repositoryUri,
      exportName: `${this.getProjectTag()}:${this.getDeployStageTag()}:${this.stackName}:EcrRepositoryUri`,
    })
  }
}
