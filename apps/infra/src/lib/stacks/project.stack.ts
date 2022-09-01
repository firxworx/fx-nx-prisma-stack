import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as iam from 'aws-cdk-lib/aws-iam'

import { FxBaseStack, FxBaseStackProps } from '../abstract/fx-base.abstract.stack'
import { RdsPostgresInstance } from '../constructs/rds-postgres-instance'

export interface ProjectStackProps extends FxBaseStackProps {
  vpc: ec2.Vpc
}

/**
 * Project stack.
 */
export class ProjectStack extends FxBaseStack {
  constructor(scope: Construct, id: string, props: ProjectStackProps) {
    super(scope, id, props)

    // this.cluster = new ecs.Cluster(this, 'Cluster', {
    //   vpc: this.vpc,
    //   clusterName: `${DEFAULT_NAME}-cluster`,
    //   containerInsights: props.containerInsights ?? false,
    // })

    const postgresInstance = new RdsPostgresInstance(this, 'Db', {
      vpc: props.vpc,
      databaseName: this.getProjectTag(),
      ...this.getBaseProps(),
    })
  }
}
