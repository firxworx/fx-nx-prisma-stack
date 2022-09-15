import { Construct } from 'constructs'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'

import { FxBaseStack, type FxBaseStackProps } from '../../abstract/fx-base.abstract.stack'

export interface EcsStackProps extends FxBaseStackProps {
  vpc: ec2.Vpc
  containerInsights?: boolean
}

/**
 * EcsStack
 */
export class EcsStack extends FxBaseStack {
  readonly cluster: ecs.Cluster

  constructor(scope: Construct, id: string, props: EcsStackProps) {
    super(scope, id, props)

    this.cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: props.vpc,
      clusterName: `${this.getProjectTag()}-${this.getDeployStageTag()}-cluster`,
      containerInsights: props.containerInsights ?? false,
    })
  }
}
