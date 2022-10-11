import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as rds from 'aws-cdk-lib/aws-rds'
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager'

import { FxBaseStack, type FxBaseStackProps } from '../../../abstract/fx-base.abstract.stack'
import { RdsPostgresInstance } from '../../../constructs/rds-postgres-instance'
import { CfnOutput } from 'aws-cdk-lib'

export interface RdsStackProps extends FxBaseStackProps {
  vpc: ec2.Vpc
  bastion: {
    securityGroup: ec2.SecurityGroup
    instance: ec2.BastionHostLinux
  }
}

export class RdsStack extends FxBaseStack {
  readonly instance: rds.DatabaseInstance
  readonly proxy: rds.DatabaseProxy | undefined
  readonly parameterGroup: rds.ParameterGroup

  readonly credentials: {
    secret: secretsManager.ISecret
    // ssm: { secretArn: ssm.StringParameter; }
  }

  constructor(scope: Construct, id: string, props: RdsStackProps) {
    super(scope, id, props)
    const { vpc } = props

    const rdsPostgresInstance = new RdsPostgresInstance(this, 'Db', {
      vpc,
      options: {
        createRdsProxy: false,
      },
    })

    const { instance, proxy, parameterGroup, credentials } = rdsPostgresInstance

    this.instance = instance
    this.proxy = proxy
    this.parameterGroup = parameterGroup
    this.credentials = credentials

    this.instance.connections.allowFrom(props.bastion.securityGroup, ec2.Port.tcp(this.instance.instanceEndpoint.port))

    this.printOutputs()
  }

  private printOutputs(): void {
    new CfnOutput(this, 'RdsInstanceEndpoint', {
      value: this.instance.instanceEndpoint.hostname,
      description: `${this.getProjectTag()}-${this.getDeployStageTag()} RDS Postgres Instance Endpoint`,
      // exportName: `${this.getProjectTag()}:${this.getDeployStageTag()}:${this.stackName}:rdsInstanceEndpoint`,
    })
  }
}
